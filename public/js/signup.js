angular.module('angularApp').controller('SignupController', ['$scope', '$http', '$location', function ($scope, $http, $location)
{

     console.log("In Signup");


     //Method to capture the user object
     $scope.register=function(user)
     {
          $http.post("/signup", user)
              .success(function (response) {

                   if (response == 'success') {

                        $location.url('/login');
                   }


              });

          console.log(user);

     }




} ]);
