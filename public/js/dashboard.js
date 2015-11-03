angular.module('angularApp').controller('DashboardController', ['$scope', '$http', '$location','webservice','$q','$log', function ($scope, $http, $location,webservice,$q,$log) {

    console.log("In Dashboard");

    var requestFinished = $q.defer();

    var prom=webservice.getLocationCoords;
    prom.then(
        function (payload)
        {
            $scope.location = payload;
            requestFinished.resolve();
        },
        function (errorPayload)
        {
            $log.error('failure getting location', errorPayload);
        });



    requestFinished.promise.then(function()
    {
        var requestDone=$q.defer();

        console.log($scope.location);
        var p = webservice.getApiData($scope.location);
        p.then(
            function (payload) {
                $scope.eventData = payload.data.events.event;
                requestDone.resolve();
            },
            function (errorPayload) {
                $log.error('failure loading movie', errorPayload);

            });

          requestDone.promise.then(function()
          {
              var rex = /(<([^>]+)>)/ig;
              for(var i=0;i<$scope.eventData.length;i++)
              {
                  if($scope.eventData[i].description!==null) {
                      $scope.eventData[i].description.toString().replace(rex, "");
                  }

              }
              console.log($scope.eventData);
          });

    });





} ]);
