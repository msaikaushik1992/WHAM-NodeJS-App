angular.module('angularApp').controller('SetPreferencesController', ['$scope', '$rootScope','$http', '$location','$cookies','$timeout','webservice',
    function ($scope, $rootScope, $http, $location,$cookies,$timeout,webservice)
{

    $scope.loggedin = true;
    $scope.name = $rootScope.currentUser.fname;
    $scope.id=$rootScope.currentUser.id;


    $scope.pref={gender:"Male",city:"Boston"};


    $scope.items=[];

    var addedCategories = {

    };


    var input = document.getElementById('location');
    var searchform = document.getElementById('form1');
    var place;
    var autocomplete = new google.maps.places.Autocomplete(input);

    //Google Map variables
    var map;
    var marker;

    //Add listener to detect autocomplete selection
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        place = autocomplete.getPlace();
        //console.log(place);
    });



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

    $scope.logout = function ()
    {
        $http.post("/logout")
            .success(function (response) {

                window.location.reload();
            });
    }

    $scope.savePreferences = function(pref)
    {
        var preferences = {};
        preferences.id=$scope.id;
        preferences.gender=pref.gender;
        preferences.city=$("#location").val();
        preferences.categories=$scope.items;

        console.log(preferences);

        $http.post("/preferences", preferences)
            .success(function (response)
            {

                if (response === 'success')
                {

                    $scope.error=false;



                    $timeout(function()
                    {
                        $rootScope.currentUser =  $rootScope.currentUser;
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

