angular.module('angularApp')
    .controller('EventController', ['$scope', '$http', 'webservice', '$routeParams', '$q', '$log', '$rootScope', '$sce', 
      function ($scope, $http, webservice, $routeParams, $q, $log, $rootScope, $sce) {

        if(window.stButtons){
            stButtons.locateElements();
        }

        $(document).ready(function () {

            $("#overlay-for-contacts2").hide();

        });

        $scope.eventDescriptionFormatted = function() {
            return $sce.trustAsHtml($scope.eventDescription);
        }
        $scope.eventCategoryFormatted = function(category) {
            return $sce.trustAsHtml(category); 
        }

        $(".closebutton2").click(function (e) {
            e.preventDefault();
            $("#overlay-for-contacts2").fadeOut("slow");
        });


        console.log("In Event Page");
        $scope.eventDetails = "TEST EVENT";
        $scope.comments = [];
        $scope.numLike = 0;
        $scope.numDislike = 0;

        $scope.loggedin=false;

        var requestDone = $q.defer();

        function findEventData() {
            var defer = $q.defer();
            var url = '/getEvent/' + $routeParams.id;
            $http.get(url).success(function (response) {
                defer.resolve(response);
            });
            return defer.promise;
        };

        function checkLoggedinUser() {
            var defer = $q.defer();
            var url = '/loggedin';
            $http.get(url).success(function (response) {
                defer.resolve(response);
            });
            return defer.promise;
        }

        var user = checkLoggedinUser().
            then(function (loggedInUser)
            {
                if(loggedInUser==='0')
                {
                    $scope.loggedin=false;
                }
                else
                {

                    $scope.user = loggedInUser;
                    console.log($scope.user);
                    $scope.loggedin = true;
                    $scope.name = loggedInUser.fname;
                }
            });

        var initializaMap = function initialize() {
            var mapProp = {
                center: new google.maps.LatLng($routeParams.lat, $routeParams.lon),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng($routeParams.lat, $routeParams.lon),
                map: map
            });
        }
        initializaMap();

        var eventData = webservice.getEventDatafromApi($routeParams.id);
        var event = findEventData();
        event.then(
            function (payload) {
                console.log(payload);
                var comments = payload.comments;
                if(comments!==undefined) {
                    $scope.commentSection = comments.length + ' comments';
                    $scope.comments = payload.comments;
                    //$scope.numLike = payload.likes.length;
                    //$scope.numDislike = payload.dislikes.length;
                }
            });
        eventData.then(
             function (payload) {
                 // load data from api call to required fields
                 //2. Ticketing/reservation information
                 //5. Event types/categories

                 // title
                 $scope.eventCategory=payload.data.categories.category;
                 $scope.eventTitle = payload.data.title;

                 // description 
                 $scope.eventDescription = payload.data.description;

                 $scope.eventMapAddr = "https://google.com/maps/place/"+payload.data.address+" "+payload.data.city+" "+payload.data.country_abbr;

                 if(payload.data.categories){
                     $scope.eventCategories = payload.data.categories.category;
                 }

                 // image
                 if (payload.data.images) {
                     if (payload.data.images.image[0]) {
                         var imageObject = payload.data.images.image[0];
                     } else {
                         var imageObject = payload.data.images.image;
                     }
                 } else if (payload.data.image) {
                     var imageObject = payload.data.image;
                 }
                 if (imageObject) {
                     $scope.eventImageUrl = imageObject.medium.url;
                     $scope.eventImageHeight = imageObject.medium.height * 2.5;
                     $scope.eventImageWidth = imageObject.medium.width * 2.5;
                 }

                 // cost of event
                 if (payload.data.price) {
                     $scope.eventCost = payload.data.price;
                 }

                 // links to the event's page
                 if (payload.data.links) {
                     $scope.eventLinks = payload.data.links.link;

                 }

                 // timing information
                 if (payload.data.all_day == 0) {
                     var startTime = payload.data.start_time;
                     var stopTime = payload.data.stop_time;

                     console.log(startTime)

                     if (startTime == stopTime || stopTime == null) {
                         $scope.eventTimingInformation = "Event starts at " + startTime;
                     } else {
                         $scope.eventTimingInformation = "Event is between " + startTime + " and " + stopTime;
                     }

                 } else if (payload.data.all_day == 1) {
                     $scope.eventTimingInformation = "This is an all day event";
                 }

                 // venue_name
                 $scope.eventVenue = payload.data.venue_name;

                 // city
                 $scope.eventCity = payload.data.city;


                 $scope.eventLocationLat = payload.data.latitude;
                 $scope.eventLocationLng = payload.data.longitude;


                 requestDone.resolve();
             },
             function (errorPayload) {
                 $log.error('failure loading event data from api', errorPayload);
             }
         );

        console.log("------------------------------");
        //console.log(scope.eventDetails);


        requestDone.promise.then(function () {
            console.log("Success");
            checklike();
            getlikes();
            getdislikes();
        });



        $scope.addComment = function () {
            comment = $scope.comment;
            if (!(typeof comment === 'undefined')) {
                var user = checkLoggedinUser();
                user.then(function (users) {
                    if (users == 0) {
                        var d = new Date();
                        var dt = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
                        var commentObj = {
                            username: "Anonymous",
                            date: dt,
                            commentText: comment,
                        }
                        console.log(commentObj);
                    }
                    else {
                        var d = new Date();
                        var dt = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
                        var commentObj = {
                            username: users.fname + " " + users.lname,
                            date: dt,
                            commentText: comment,
                            email: users.email
                        }
                    }
                    var defer = $q.defer();
                    var eventid = $routeParams.id;
                    var res;
                    $http.post('/addComment/' + eventid, commentObj).success(function (response) {
                        $scope.comment = "";
                        defer.resolve(response);
                        res = response;
                        console.log(response);
                        $scope.comments = res.comments;
                        var commentCount = res.comments.length;
                        $scope.commentSection = commentCount + " comments";
                    });                   
                    return defer.promise;
                });
            }
        }

        var checklike = function()
        {
            var user = checkLoggedinUser();
            user.then(function (users) {
                if (users != 0) {
                    var url = '/checklike/'+ $routeParams.id +'/' + users.id;
                    $http.get(url)
                        .success(function (response)
                        {
                            console.log(response);
                            if(response=='duplicate')
                            {

                               $scope.unlike=true;

                            }
                        });
                }
            });


        }


        var getlikes = function()
        {
                    var url = '/getlikes/';
                    $http.get(url+ $routeParams.id)
                        .success(function (response)
                        {
                            $scope.numLike=response;

                        });
        }

        var getdislikes = function()
        {
            var url = '/getdislikes/';
            $http.get(url+ $routeParams.id)
                .success(function (response)
                {
                    $scope.numDislike=response;
                    console.log(response);
                });
        }

        $scope.unlikeEvent=function()
        {
            var user = checkLoggedinUser();
            user.then(function (users) {
                    var data={'id':users.id};
                    $http.delete("/unlike/"+ $routeParams.id +'/' + users.id)
                        .success(function (response) {
                            console.log(response);
                            if (response == 'success')
                            {
                                      $scope.unlike=false;
                                      getlikes();


                            }
                        });
                });
        }


        $scope.like=function()
        {
            var user = checkLoggedinUser();
            user.then(function (users) {
                if (users != 0) {
                    var url = '/likeEvent';
                    var data={'userid':users.id, 'eventid':$routeParams.id,
                        'categories':$scope.eventCategory,type:'like','title': $scope.eventTitle,
                        'img':$scope.eventImageUrl,'lat':$routeParams.lat,'lon':$routeParams.lon}
                    console.log(url);
                    $http.post(url,data)
                        .success(function (response)
                        {
                             console.log(response);
                            if(response=='success')
                            {
                                getlikes();
                                getdislikes();
                                $scope.unlike=true;
                                $http.put('/updateCategories',data)
                                    .success(function(response)
                                    {

                                        console.log(response);

                                    });

                            }
                        });
                }
            });

        }

        $scope.displayAlert=function()
        {
            $("#overlay-for-contacts2").fadeIn("slow");
        }

        $scope.dislike=function()
        {

            var user = checkLoggedinUser();
            user.then(function (users) {
                if (users != 0) {
                    var url = '/dislikeEvent';
                    var data={'userid':users.id, 'eventid':$routeParams.id,
                        'categories':$scope.eventCategory,type:'dislike','title': $scope.eventTitle,
                        'img':$scope.eventImageUrl,'lat':$routeParams.lat,'lon':$routeParams.lon}
                    console.log(url);
                    $http.post(url,data)
                        .success(function (response)
                        {
                            console.log(response);
                            if(response=='success')
                            {
                                $scope.unlike=false;
                                getdislikes();
                                getlikes();
                            }
                        });
                }
            });


        }



        $scope.deleteComment = function (commentid) {
            var url = "/deleteComment/" + $routeParams.id + "/" + commentid;
            $http.delete(url).success(function (response) {
                console.log(response);
                $scope.comments = response.comments;
                var commentCount = response.comments.length;
                $scope.commentSection = commentCount + " comments";
            })
        };


        //Implement the logout function

        $scope.logout = function ()
        {
            $http.get("/logout")
                .success(function (response) {

                    window.location.reload();
                    $scope.loggedin=false;
                });
        }

    }]);