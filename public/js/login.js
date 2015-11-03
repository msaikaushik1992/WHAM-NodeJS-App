angular.module('angularApp').controller('LoginController', ['$scope', '$http', '$location', function ($scope, $http, $location)
{

    console.log("In Login");


    //Method to capture the user object
    $scope.login=function(user)
    {
        console.log(user);

    }




} ]);
