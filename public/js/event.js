angular.module('angularApp')
    .controller('EventController', ['$scope', '$http', 'webservice', '$routeParams', '$q', '$log', function ($scope, $http, webservice ,$routeParams, $q, $log) {

        console.log("In Event Page");
        $scope.eventDetails = "TEST EVENT";

        var requestDone=$q.defer();

        var eventData = webservice.getEventDatafromApi($routeParams.id);

        eventData.then(
            function (payload) {
                // load data from api call to required fields
                //2. Ticketing/reservation information
                //5. Event types/categories



                // title
                $scope.eventTitle = payload.data.title;

                // description
                $scope.eventDescription = payload.data.description;

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
                    $scope.eventImageHeight = imageObject.medium.height;
                    $scope.eventImageWidth = imageObject.medium.width;
                }

                // cost of event
                if(payload.data.price){
                    $scope.eventCost = payload.data.price;
                }

                // links to the event's page
                if(payload.data.links) {
                    $scope.eventLinks = payload.data.links.link;
                    //console.log("in links " + payload.data.links.link[0].type);
                    //
                    //for (var i = 0; i< payload.data.links; i++){
                    //    if (payload.data.links.link[i].type == "Official Site"){
                    //        $scope.eventLinkMain = payload.data.links.link[i].url;
                    //    }
                    //    if (payload.data.links.link[i].type == "Tickets"){
                    //        console.log("in links")
                    //        $scope.eventLinkTicket = payload.data.links.link[i].url;
                    //    }
                    //}
                }

                console.log($scope.eventLinkMain);
                console.log($scope.eventLinkTicket);

                // timing information
                if(payload.data.all_day == 0){
                    var startTime = payload.data.start_time;
                    var stopTime = payload.data.stop_time;

                    console.log(startTime)

                    if(startTime == stopTime || stopTime == null){
                        $scope.eventTimingInformation = "Event starts at " + startTime;
                    } else {
                        $scope.eventTimingInformation = "Event is between " + startTime + " and " + stopTime;
                    }

                } else if(payload.data.all_day == 1){
                    $scope.eventTimingInformation = "This is an all day event";
                }

                // venue_name
                $scope.eventVenue = payload.data.venue_name;

                // city
                $scope.eventCity = payload.data.city;


                $scope.eventLocationLat = payload.data.latitude;
                $scope.eventLocationLng = payload.data.longitude;

                //latitude
                //longitude



                requestDone.resolve();
            },
            function (errorPayload) {
                $log.error('failure loading event data from api', errorPayload);
            }
        );

        console.log("------------------------------");
        //console.log(scope.eventDetails);


        requestDone.promise.then(function(){
            function initialize() {
                var mapProp = {
                    center:new google.maps.LatLng($scope.eventLocationLat,$scope.eventLocationLng),
                    zoom:5,
                    mapTypeId:google.maps.MapTypeId.ROADMAP
                };
                var map=new google.maps.Map(document.getElementById("googleMap"), mapProp);
            }
            google.maps.event.addDomListener(window, 'load', initialize);
        });


} ]);
