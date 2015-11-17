angular.module('angularApp').controller('SetPreferencesController', ['$scope', '$rootScope','$http', '$location','$cookies','$timeout','webservice',
    function ($scope, $rootScope, $http, $location,$cookies,$timeout,webservice)
{

    if($cookies.getObject("info")===undefined)
    {

            $location.url('/signup');
    }
    else
    {

        console.log($cookies.getObject("info"));
        console.log($cookies.get("id"));
    }


    $scope.pref={gender:"Male",city:"Boston"};


    $scope.items=[];

    var addedCategories = {

    };


    $scope.addCategory=function()
    {
        var e = document.getElementById("category");
        var category = e[e.selectedIndex].id;
        var categoryText = e.options[e.selectedIndex].text;
        console.log(category);
        if(addedCategories[category]==null || addedCategories[category]==undefined) {
            $scope.items.push({'category': category,'categoryText': categoryText})
            console.log($scope.items);
            addedCategories[category]=category;
        }
    }

    $scope.clearItems=function(item)
    {

         $scope.items= $scope.items.filter(function (el) {
             addedCategories[item.category]=null;
             return el.category !== item.category;

          });

        console.log($scope.items);

    }

    $scope.savePreferences = function(pref)
    {
        var preferences = {};
        preferences.id=$cookies.get("id");
        preferences.gender=pref.gender;
        preferences.city=pref.city;
        preferences.categories=$scope.items;

        console.log(preferences);

        $http.post("/preferences", preferences)
            .success(function (response)
            {

                if (response === 'success')
                {

                    $scope.error=false;
                    $cookies.remove("id");



                    $timeout(function()
                    {
                        $rootScope.currentUser =  $cookies.getObject("info");
                        $cookies.remove("info");
                        $location.url('/');
                    }, 3000);

                }
                else
                {
                    $scope.error=true;
                }
            });
    }


} ]);

