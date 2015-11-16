angular.module('angularApp').controller('LoginController', ['$scope', '$http', '$location','$rootScope','$route', function ($scope, $http, $location,$rootScope,$route)
{

    console.log("In Login");


    //Method to capture the user object
    $scope.login=function(user)
    {
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
                    $rootScope.currentUser = response;
                    $location.url("/");
                }
            })
            .error(function (response) {

            $scope.invalid = true;
        });

    }

} ]);
