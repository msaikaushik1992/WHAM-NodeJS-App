
angular.module('angularApp').controller('ProfileController', ['$scope', '$rootScope','$http', '$location','$cookies','$timeout','webservice',
    function ($scope, $rootScope, $http, $location,$cookies,$timeout,webservice)
    {

            $scope.loggedin = true;
            $scope.name = $rootScope.currentUser.fname;
            $scope.id=$rootScope.currentUser.id;
            $http.get("/profileinfo/"+ $rootScope.currentUser.id)
                .success(function (response)
                {
                    if (response == 'error') {
                        console.log("Error Occured");
                    }
                    else if (response == 'empty') {
                        $location.url('/set-preferences');
                    }
                    else {
                        console.log(response);
                        $scope.profile = response;
                        initializeProfileInfo();
                        getLikedEvents();
                    }
                })
                .error(function (response)
                {

                    console.log("Error Occured");

                });



        var getLikedEvents=function()
        {
            $http.get("/getLikedEvents/"+ $scope.id)
                .success(function (response) {

                    console.log(response);
                    $scope.likedEvents=response;
                });

        }


        var initializeProfileInfo = function()
        {
            $scope.pref={};

            $scope.options = [{ name: "Male", id: 1 }, { name: "Female", id: 2 }];

            $scope.gender=$scope.profile.gender;
            if($scope.gender==="Male")
            {
                $scope.pref.selectedOption = $scope.options[0];
            }
            else
            {
                $scope.pref.selectedOption = $scope.options[1];

            }

            $scope.pref.city=$scope.profile.city;

            for(var i=0; i<$scope.profile.categories.length;i++)
            {
                    $scope.items.push($scope.profile.categories[i]);
                    console.log($scope.items);
                    addedCategories[$scope.profile.categories[i].category] = $scope.profile.categories[i].category;
            }

        }

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


        $scope.logout = function ()
        {
            $http.post("/logout")
                .success(function (response)
                {
                    window.location.reload();
                });
        }

        $scope.update=function(pref)
        {
            $scope.apply;
            var preferences={};
            preferences.id=$scope.id;
            preferences.gender=pref.selectedOption.name;
            preferences.city=$("#location").val()
            preferences.categories=$scope.items;

            console.log(preferences);

            $http.put("/updatePreferences/" + $scope.id, preferences)
                .success(function (response)
                {

                    if (response === 'success')
                    {

                        $scope.error=false;
                    }
                    else if(response=='empty')
                    {
                        console.log(response);
                        $scope.error=true;
                    }
                    else
                    {
                        console.log(response);
                        $scope.error=true;
                    }
                });
        }

        $scope.updatePassword=function(password)
        {
            $http.put("/updatePassword/" + $scope.id, password)
                .success(function (response)
                {

                    if (response === 'success')
                    {

                        $scope.errorResetPassword=false;
                    }
                    else if(response=='empty')
                    {
                        console.log(response);
                        $scope.errorResetPassword=true;
                    }
                    else
                    {
                        console.log(response);
                        $scope.errorResetPassword=true;
                    }
                });
        }

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




    } ]);