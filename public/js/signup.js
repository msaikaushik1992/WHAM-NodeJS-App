angular.module('angularApp').controller('SignupController', ['$scope','$rootScope','$cookies','$http', '$location',
     function ($scope, $rootScope,$cookies,$http, $location)
{

     console.log("In Signup");

     //Method to capture the user object
     $scope.register=function(user)
     {
          $http.post("/signup", user)
              .success(function (response) {

                   if (response === 'success') {

                        $cookies.put("email",user.email);
                        $location.url('/set-preferences');

                   }
              });


     }

} ]);
