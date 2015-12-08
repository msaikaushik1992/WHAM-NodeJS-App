angular.module('angularApp').controller('DashboardController', 
  ['$scope', '$http', '$location','webservice','$q','$log','$route','$rootScope',
  function ($scope, $http, $location,webservice,$q,$log,$route,$rootScope) {
    
    $(document).ready(function () {
        //this will attach the class to every target
        $("li").on('click', function (event) {
            $target = $(event.target);
            $target.addClass('active');
            console.log("Clicked");
        });
    });
    
    $scope.result1 = '';
    $scope.options1 = null;
    $scope.details1 = '';

    $scope.showdashboard=true;
    $scope.loading=true;
    $scope.searchresult=false;
    $scope.searchloading=false;

    // reload the page after the search result is shown
    $scope.loadDash = function () {
      // body...
      window.location.reload();
    }

    // search functions
    $scope.searchEvents= function(search) {
        // hide dashboard
        $scope.showdashboard=false;
        $scope.loading=false;
        
        // show search results
        $scope.searchloading=true;

        var searchByQuery = ((typeof search.query != "undefined") ? search.query : "");
        var searchByCategory = ((typeof search.cat != "undefined") ? search.cat : "");
        var searchByLocatioin = ((typeof search.loc != "undefined") ? search.loc : "");
        console.log("Query:" +searchByQuery+ " Category:" +searchByCategory+ " Location:" + searchByLocatioin);

        $scope.search.loc = searchByLocatioin;
        $scope.search.category = searchByCategory;
        $scope.search.query = searchByQuery;
        getSearchResult();
    }

    // helper funtions for generating dashboard or searchboard
    function loadBoardforCurrentUser (boardName) {
        // body...
        console.log($rootScope.currentUser);
        $scope.loggedin = true;
        $scope.name = $rootScope.currentUser.fname;
        $scope.id= $rootScope.currentUser.id;
        $http.get("/preferences/"+ $rootScope.currentUser.id)
        .success(function (response) {
            if (response == 'error') {
                console.log("Error Occured");
            } else if(response=='empty') {
                $location.url('/set-preferences');
            } else {
                console.log(response);
                if (boardName == 'search') {                     
                    populateSearch(response, $scope.search); 
                } else {
                    populateDashboard(response);
                }
            }
        })
        .error(function (response) {
            console.log("Error Occured");
        });
    }

    function loadBoardforAllUsers(boardName) {
      console.log($scope.loggedin);
            var loggedInStatus = webservice.checkLoggedIn;
            var populate = $q.defer();

            loggedInStatus.then(
                function (response) 
                {
                    if (response == '0') {
                        console.log("this");
                        $scope.loggedin = false;
                        console.log(response);
                        $scope.$apply();
                        $scope.prefs=null;
                        populate.resolve();
                    } else {
                        console.log("that");
                        $scope.loggedin = true;
                        $scope.name = response.fname;
                        $scope.id = response.id;
                        console.log($scope.name);
                        console.log(response.id);
                        $scope.$apply();
                        $http.get("/preferences/"+ response.id)
                            .success(function (response) {
                                if (response == 'error') {
                                    console.log("Error Occured");
                                } else if(response=='empty') {
                                    $location.url('/set-preferences');
                                } else {
                                    console.log(response);
                                    $scope.prefs=response;
                                    populate.resolve();
                                }
                            }).error(function (response) {
                                console.log("Error Occured");
                            });
                    }
                },
                function (errorPayload) {
                    $log.error('Error checking Log In Status', errorPayload);
                });

            // complete promise
            populate.promise.then(function () {
                if (boardName == 'search') {
                    populateSearch($scope.prefs, $scope.search);
                } else {
                    populateDashboard($scope.prefs);
                }
                
            });
    }

    // get search result
    function getSearchResult () {
        if($rootScope.currentUser) {
            loadBoardforCurrentUser('search');
        } else {
            loadBoardforAllUsers('search');
        }
    }


    // Generating Dashboard

    getDashboard();

    function getDashboard () {
      // body...
        if($rootScope.currentUser) {
            loadBoardforCurrentUser();
        } else {
            loadBoardforAllUsers();
        }
   
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

              generateInitialMap();
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
                              $scope.array = new Array(Math.round($scope.eventData.length / 12));
                              for (var i = 0; i < $scope.array.length; i++) {
                                  $scope.array[i] = i + 1;
                              }
                              $scope.dataPerPage = $scope.eventData.slice(0, 12);
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
    /*Function to populate the dashboard with events.
     Called only when the promise resolves.*/

    function populateSearch(userPrefs, searchParams) {
          $scope.searchresult=true;
          $scope.searchLoc='';

          console.log("User Preferences:" + userPrefs);
          console.log("Search: " + searchParams);

          var searchFinished = $q.defer();

          if (searchParams.loc != '') {
            console.log("Get location coords");
            var result = webservice.getLocationCoordsQuery(searchParams);
            result.then(
                      function (res) {
                          console.log("Please: "+res.data.results[0].geometry.location.lat);
                          $scope.searchLoc = {
                            lat:res.data.results[0].geometry.location.lat,
                            long:res.data.results[0].geometry.location.lng,
                          }
                          console.log($scope.searchLoc);
                          searchFinished.resolve();
                     },
                      function (errorResult) {
                          $log.error('failure loading movie', errorResult);
                          console.log("Error retrieving events");

                      });
             
          } else if ($scope.location) {
            searchFinished.resolve();
          }
          // var prom = webservice.getLocationCoords;
          // prom.then(
          //     function (payload) {
          //         $scope.location = payload;
          //         searchFinished.resolve();
          //     },
          //     function (errorPayload) {
          //         $log.error('failure getting location', errorPayload);
          //     });

          searchFinished.promise.then(function () {
              var searchDone = $q.defer();
              var resutls;

              if (userPrefs !== null) {
                  console.log($scope.location);
                  
                  if (searchParams.query != '') {
                    resutls = webservice.getEventsByLocationPreferenceAndQuery($scope.location, userPrefs, searchParams);
                  } else if (searchParams.loc != '') {
                    console.log(searchParams.loc);
                    resutls = webservice.getEventsByPreferenceAndQLocation(userPrefs, $scope.searchLoc);
                  }
                  resutls.then(
                      function (result) {
                          console.log(result.data.total_items);
                          $scope.datalength = result.data.total_items;
                          $scope.searchData = result.data.events.event; 
                          searchDone.resolve();
                      },
                      function (errorResult) {
                          $log.error('failure loading movie', errorResult);
                          console.log("Error retrieving events");

                      });
              }
              else {
                  console.log($scope.location);

                  console.log("Search: " + $scope.searchLoc);
                  if (searchParams.query != '') {
                    resutls = webservice.getEventsByLocationAndQuery($scope.location, searchParams);
                  } else if (searchParams.loc != '') {
                    resutls = webservice.getEventsByQLocation($scope.searchLoc);
                  } else if (searchParams.category != '') {
                    resutls = webservice.getEventsByQPreference($scope.location, searchParams);
                  }
                  resutls.then(
                      function (result) {
                          $scope.datalength = result.data.total_items;
                          $scope.searchData = result.data.events.event;
                          searchDone.resolve();
                      },
                      function (errorPayload) {
                          $log.error('failure loading movie', errorPayload);
                          console.log("Did not get coordinates");

                      });

              }

              searchDone.promise.then(function () {
                      $scope.searchloading = false;
                      $scope.searchDataPerPage=[];
                      console.log($scope.datalength);
                      if ($scope.datalength > 1) {
                          $scope.searchArray = new Array(Math.round($scope.searchData.length / 12));
                          for (var i = 0; i < $scope.searchArray.length; i++) {
                              $scope.searchArray[i] = i + 1;
                          }
                          $scope.searchDataPerPage=$scope.searchData.slice(0,12);
                            
                      } else {
                        console.log("SingleEvent:" + $scope.searchData.title);
                        $scope.searchDataPerPage=new Array($scope.searchData).slice(0,12);
                        console.log($scope.searchDataPerPage);
                          
                      }
                      generateMap($scope, 'search');
                      $scope.isEventSelected=1;
              });

          });

      }

    $scope.paginate = function(event,i)
    {
        $('ul.pevent>li').removeClass('active');
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
        $target = $(event.target).parent();
        $target.addClass('active');
        $("html, body").animate({ scrollTop: 0 }, "slow");
        generateMap($scope);
    }

    $scope.paginateSearch = function(event,i)
    {
        $('ul.psrch>li').removeClass('active');
        $scope.searchDataPerPage=$scope.searchData.slice((i-1)*12,(i-1)*12+12);
        console.log($scope.searchDataPerPage);
        var averageLatitude = 0,averageLongitude = 0;
        var dpp = $scope.searchDataPerPage;
        for(var i = 0; i<dpp.length; i++){
            averageLatitude+=dpp[i].latitude;
            averageLongitude+=dpp[i].longitude;
        }
        averageLatitude/=dpp.length;
        averageLongitude/=dpp.length;
        $scope.isEventSelected=i;
        $target = $(event.target).parent();
        $target.addClass('active');
        $("html, body").animate({ scrollTop: 0 }, "slow");
        
      generateMap($scope, 'search');
    }

      $scope.isActive = function(item)
      {
        return $scope.isSelected === item;
      };


      $scope.isSearchActive = function(item)
      {
        return $scope.isEventSelected === item;
      };
    //Implement the logout function

    $scope.logout = function ()
    {
        $http.post("/logout")
            .success(function (response) {

                window.location.reload();
            });
    }

    function generateInitialMap() {
      var gm = google.maps;
      var map = new gm.Map(document.getElementById('map'), {
        center: new google.maps.LatLng($scope.location.lat,$scope.location.long),
        zoom: 11
      });
      var marker = new google.maps.Marker({
          position: new google.maps.LatLng($scope.location.lat,$scope.location.long),
          map: map,
          title: 'I am here!'
      });

      $scope.map = map;
    }

    function generateMap($scope, search){
      $scope.markers = [];

      var labels= "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      labelIndex=0;
      
      var gm = google.maps;
      var map = new gm.Map(document.getElementById('map'), {
        center: new google.maps.LatLng($scope.location.lat,$scope.location.long),
        zoom: 11
      });
      var marker = new google.maps.Marker({
          position: new google.maps.LatLng($scope.location.lat,$scope.location.long),
          map: map,
          title: 'I am here!'
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
      
      if (search == 'search') {
        $scope.eventsPerPage=$scope.searchDataPerPage;
      } else {
        $scope.eventsPerPage=$scope.dataPerPage;
      }
      for(var i = 0; i<$scope.eventsPerPage.length; i++) {
          var obj = $scope.eventsPerPage[i];
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
          bounds.extend(marker.position);
          marker.desc = '<a href="#event/'+obj.id+'/'+obj.latitude+'/'+obj.latitude+'">'+obj.title+'<a>';
          oms.addMarker(marker);
          $scope.markers.push(marker);
          // gm.event.addListener(marker, 'click', function() {
          //     window.location.href = this.url;
          // });

      }
      map.fitBounds(bounds);
      $scope.map = map;
    }

} ]);
