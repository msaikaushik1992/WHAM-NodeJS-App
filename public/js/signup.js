angular.module('angularApp').controller('SignupController', ['$scope','$rootScope','$cookies','$http', '$location',
     function ($scope, $rootScope,$cookies,$http, $location)
{
     //Method to capture the user object
     $scope.register=function(user)
     {
          $http.post("/signup", user)
              .success(function (response)
              {

                   if (response === 'success') {

                       $http.post("/login", user)
                           .success(function (response)
                           {
                               if (response == null)
                               {
                                   console.log("Response is null");
                                   $scope.invalid = true;
                               }
                               else
                               {
                                   $cookies.putObject("info",response);
                                   $cookies.put("id",response.id);
                                   $location.url('/set-preferences');
                               }
                           })
                           .error(function (response) {

                               $scope.invalid = true;
                           });
                   }
                  else
                   {
                       $scope.duplicate=true;
                   }

              })
               .error(function (response) {

                $location.url('/signup');
                  $scope.duplicate=true;
           })

     }

} ]);
