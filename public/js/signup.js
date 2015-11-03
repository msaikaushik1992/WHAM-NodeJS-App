angular.module('angularApp').controller('SignupController', ['$scope', '$http', '$location', function ($scope, $http, $location)
{

     console.log("In Signup");


     //Method to capture the user object
     $scope.register=function(user)
     {
          console.log(user);

     }




} ]);
