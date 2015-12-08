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
        $scope.id= $rootScope.currentUser.id;
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
                    $scope.id = response.id;
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


      function populateDashboard(userPrefs) {

          console.log("User Preferences:" + userPrefs);
          var requestFinished = $q.defer();

          var prom = webservice.getLocationCoords;
          prom.then(
              function (payload) {
                  $scope.location = payload;
                  requestFinished.resolve();
              },
              function (errorPayload) {
                  $log.error('failure getting location', errorPayload);
                  console.log("Error getting location");
              });

          /*if(prom==undefined)
          {
              $scope.location =  {lat:'42.340112',
              long: '-71.08970'};
              requestFinished.resolve();
          }*/


          requestFinished.promise.then(function () {
              var requestDone = $q.defer();

              if (userPrefs !== null) {

                  console.log($scope.location);
                  var p = webservice.getEventsByPreference($scope.location, userPrefs);
                  p.then(
                      function (payload) {
                          $scope.eventData = payload.data.events.event;
                          console.log($scope.eventData.length);
                          requestDone.resolve();
                      },
                      function (errorPayload) {
                          $log.error('failure loading movie', errorPayload);
                          console.log("Error retrieving events");

                      });

              }
              else {

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
                  if ($scope.loggedin) {
                      var data = $scope.eventData;
                      $http.get('/getDislikedEvents/' + $scope.id)
                          .success(function (res) {

                              if (res !== null) {
                                  for (var i = 0; i < data.length; i++) {

                                      if (res.hasOwnProperty(data[i].id)) {
                                          data.splice(i, 1);
                                          console.log('deleted');
                                          i--;
                                      }
                                  }
                              }

                              $scope.eventData = data;
                              $scope.loading = false;
                              $scope.array = new Array(Math.round($scope.eventData.length / 9));
                              for (var i = 0; i < $scope.array.length; i++) {
                                  $scope.array[i] = i + 1;
                              }
                              $scope.dataPerPage = $scope.eventData.slice(0, 9);
                              generateMap($scope);
                              $scope.isSelected = 1;


                          });
                  }
                      $scope.loading = false;
                      $scope.array = new Array(Math.round($scope.eventData.length / 12));
                      for (var i = 0; i < $scope.array.length; i++) {
                          $scope.array[i] = i + 1;
                      }
                      $scope.dataPerPage=$scope.eventData.slice(0,12);
                      generateMap($scope);
                      $scope.isSelected=1;
              });


          });


      }





    $scope.paginate = function(event,i)
    {
        $scope.dataPerPage=$scope.eventData.slice((i-1)*12,(i-1)*12+12);
        console.log($scope.dataPerPage);
        var averageLatitude = 0,averageLongitude = 0;
        var dpp = $scope.dataPerPage;
        for(var i = 0; i<dpp.length; i++){
            averageLatitude+=dpp[i].latitude;
            averageLongitude+=dpp[i].longitude;
        }
        averageLatitude/=dpp.length;
        averageLongitude/=dpp.length;
        $scope.isSelected=i;
        $target = $(event.target);
        $target.addClass('active');
        $("html, body").animate({ scrollTop: 0 }, "slow");
        generateMap($scope);
    }


      $scope.isActive = function(item)
      {
        return $scope.isSelected === item;

      };


    //Implement the logout function

    $scope.logout = function ()
    {
        $http.post("/logout")
            .success(function (response) {

                window.location.reload();
            });
    }

    function generateMap($scope){
      $scope.markers = [];

      var labels= "123456789";
      labelIndex=0;
      var gm = google.maps;
      var map = new gm.Map(document.getElementById('map'), {
        center: new google.maps.LatLng($scope.location.lat,$scope.location.long),
        zoom: 11
      });

      var iw = new gm.InfoWindow();
      var oms = new OverlappingMarkerSpiderfier(map,
        {markersWontMove: true, markersWontHide: true});
      
      var usualColor = '3385ff';
      var spiderfiedColor = 'b3d1ff';
      
      var iconWithColor = function(color) {
        return 'http://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin|+|' +
          color + '|000000|ffff00';
      }
      
      var shadow = new gm.MarkerImage(
        'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
        new gm.Size(37, 34),  // size   - for sprite clipping
        new gm.Point(0, 0),   // origin - ditto
        new gm.Point(10, 34)  // anchor - where to meet map location
      );
      
      oms.addListener('click', function(marker) {
        iw.setContent(marker.desc);
        iw.open(map, marker);
      });
      oms.addListener('spiderfy', function(markers) {
        for(var i = 0; i < markers.length; i ++) {
          markers[i].setIcon(iconWithColor(spiderfiedColor));
          markers[i].setShadow(null);
        } 
        iw.close();
      });

      oms.addListener('unspiderfy', function(markers) {
        for(var i = 0; i < markers.length; i ++) {
          markers[i].setIcon(iconWithColor(usualColor));
          markers[i].setShadow(shadow);
        }
      });
      var bounds = new gm.LatLngBounds();

      for(var i = 0; i<$scope.dataPerPage.length; i++) {
                var obj = $scope.dataPerPage[i];
                var loc = {lat : Number(obj.latitude), lng: Number(obj.longitude)};
                var marker = new gm.Marker({
                    position: loc,
                    map: map,
                    title: obj.title,
                    label: labels[labelIndex++ % labels.length],
                    icon: iconWithColor(usualColor),
                    shadow: shadow,
                    url: "#event/"+obj.id+"/"+Number(obj.latitude)+"/"+obj.longitude
                });
                marker.desc = '<a href="#event/'+obj.id+'/'+obj.latitude+'/'+obj.latitude+'">'+obj.title+'<a>';
                oms.addMarker(marker);
                $scope.markers.push(marker);
                // gm.event.addListener(marker, 'click', function() {
                //     window.location.href = this.url;
                // });

            }
      $scope.map = map;
      }


      

    } ]);
