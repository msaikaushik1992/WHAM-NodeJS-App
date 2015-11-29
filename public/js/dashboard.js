angular.module('angularApp').controller('DashboardController', ['$scope', '$http', '$location','webservice','$q','$log','$route','$rootScope', function ($scope, $http, $location,webservice,$q,$log,$route,$rootScope) {



    $(document).ready(function ()
    {

        //this will attach the class to every target
        $("li").on('click', function (event) {
            $target = $(event.target);
            $target.addClass('active');
            console.log("Clicked");
        });

    })


    $scope.loading=true;
    if($rootScope.currentUser)
    {
        console.log($rootScope.currentUser);
        $scope.loggedin = true;
        $scope.name = $rootScope.currentUser.fname;
        $http.get("/preferences/"+ $rootScope.currentUser.id)
            .success(function (response)
            {
                if (response == 'error')
                {
                    console.log("Error Occured");
                }
                else if(response=='empty')
                {
                    $location.url('/set-preferences');
                }
                else
                {
                    console.log(response);
                     populateDashboard(response);
                }
            })
            .error(function (response)
            {

                console.log("Error Occured");

            });
    }
    else
    {


        var loggedInStatus = webservice.checkLoggedIn;
        var populate = $q.defer();
        loggedInStatus.then(
            function (response) {
                if (response == '0') {
                    $scope.loggedin = false;
                    console.log(response);
                    $scope.$apply();
                    $scope.prefs=null;
                  populate.resolve();


                }
                else {
                    $scope.loggedin = true;
                    $scope.name = response.fname;
                    console.log($scope.name);
                    $scope.$apply();
                    $http.get("/preferences/"+ response.id)
                        .success(function (response)
                        {
                            if (response == 'error')
                            {
                                console.log("Error Occured");
                            }
                            else if(response=='empty')
                            {
                                $location.url('/set-preferences');
                            }
                            else
                            {
                                console.log(response);
                                $scope.prefs=response;
                                populate.resolve();
                            }
                        })
                        .error(function (response)
                        {

                            console.log("Error Occured");

                        });

                }
            },
            function (errorPayload) {
                $log.error('Error checking Log In Status', errorPayload);
            });


        populate.promise.then(function ()
        {
            populateDashboard($scope.prefs);
        });
    }







    /*Function to populate the dashboard with events.
     Called only when the promise resolves.*/


      function populateDashboard(userPrefs)
      {

           console.log("User Preferences:"+ userPrefs);
           var requestFinished = $q.defer();

           var prom = webservice.getLocationCoords;
           prom.then(
               function (payload) {
                   $scope.location = payload;
                   requestFinished.resolve();
               },
               function (errorPayload) {
                   $log.error('failure getting location', errorPayload);
               });


           requestFinished.promise.then(function ()
           {
               var requestDone = $q.defer();

              if(userPrefs!==null)
              {

                  console.log($scope.location);
                  var p = webservice.getEventsByPreference($scope.location,userPrefs);
                  p.then(
                      function (payload) {
                          $scope.eventData = payload.data.events.event;
                          console.log( $scope.eventData.length);
                          requestDone.resolve();
                      },
                      function (errorPayload) {
                          $log.error('failure loading movie', errorPayload);
                          console.log("Error retrieving events");

                      });

              }
              else
              {

                  console.log($scope.location);
                  var p = webservice.getApiData($scope.location);
                  p.then(
                      function (payload) {
                          console.log(payload);
                          $scope.eventData = payload.data.events.event;
                          console.log($scope.eventData.length);
                          requestDone.resolve();
                      },
                      function (errorPayload) {
                          $log.error('failure loading movie', errorPayload);
                          console.log("Did not get coordinates");

                      });

              }

               requestDone.promise.then(function () {
                   $scope.loading = false;
                   $scope.array = new Array(Math.round($scope.eventData.length / 10));
                   for (var i = 0; i < $scope.array.length; i++) {
                       $scope.array[i] = i + 1;
                   }
                   $scope.dataPerPage=$scope.eventData.slice(0,10);
                   $scope.isSelected=1;
               });


           });
       }

      $scope.paginate = function(event,i)
      {
          $scope.dataPerPage=$scope.eventData.slice((i-1)*10,(i-1)*10+10);
          $scope.isSelected=i;
          $target = $(event.target);
          $target.addClass('active');
          $("html, body").animate({ scrollTop: 0 }, "slow");
      }


      $scope.isActive = function(item)
      {
        return $scope.isSelected === item;

      };


    //Implement the logout function

    $scope.logout = function ()
    {
        $http.get("/logout")
            .success(function (response) {

                window.location.reload();
            });
    }





    } ]);
