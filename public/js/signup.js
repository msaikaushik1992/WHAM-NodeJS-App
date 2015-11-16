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

                        $http.get("/getUserInfo/" + user.email)
                            .success(function (response) {

                                 if (response !== null) {

                                      $cookies.put("id", response.id);
                                      $location.url('/set-preferences');

                                 }
                                else
                                 {
                                     console.log("Error");
                                 }
                            })
                            .error(function (response) {

                                 $location.url('/signup');

                            });
                   }

              })
               .error(function (response) {

          $location.url('/signup');
           })

     }

} ]);
