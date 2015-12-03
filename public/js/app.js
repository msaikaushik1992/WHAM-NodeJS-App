// MODULE
var angularApp = angular.module('angularApp', ['ngRoute','door3.css','ngCookies']);



angularApp.service('webservice',function($http)
{
    var self = this;
    self.getApiData = function (locationObj)
    {
       return $http.get("/eventsByLocation/"+ JSON.stringify(locationObj));

    }

    // event data call
    this.getEventDatafromApi = function (eventId) {
        return $http.jsonp("http://api.eventful.com/json/events/get?app_key=MTbVVjGdhvvx5r5L&id="+eventId+"&callback=JSON_CALLBACK");

    }

    self.getEventsByPreference = function(locationObj, preferences)
    {

        console.log(preferences);
        var categoryList="";
        for(var i=0; i<preferences.length;i++)
        {
            categoryList+=(preferences[i].category)+",";
        }
        categoryList=categoryList.substring(0,categoryList.length-1);
        var locationAndPreferences={location:locationObj,categories:categoryList};
        return $http.get("/eventsByLocationAndPreference/"+ JSON.stringify(locationAndPreferences));
    }

    self.checkLoggedIn = new Promise(function (resolve, reject)
    {
        isLoggedIn();

        function isLoggedIn() {
            $http.get("/loggedin")
                .success(function (response) {
                    resolve(response);
                })
                .error(function (response) {

                    reject(Error("An Error Occured"));
                });

        }
    });


    self.getLocationCoords = new Promise(function (resolve, reject)
    {
        getLocation();

        function getLocation() {
            if (navigator.geolocation) {

                return navigator.geolocation.getCurrentPosition(showPosition);
            }
            else
            {
                reject(Error("It broke"));
            }
        }

        function showPosition(position) {
            var positionObj =
            {
                lat: position.coords.latitude,
                long: position.coords.longitude
            }
            $http.get("getLocation").success(function(response) {
                if (response.lat == undefined) {

                    $http.post("location", positionObj).success(function (response) {
                        resolve(positionObj);
                    });
                }
                else{
                    if (((response.lat - positionObj.lat ) > 0.01 || (positionObj.lat - response.lat) > 0.01)
                        || ((response.long - positionObj.long) > 0.01 || (positionObj.long - response.long) > 0.01)) {

                        console.log("Changing co-ords");
                        console.log(positionObj.lat);
                        resolve(positionObj);
                    }
                    else {

                        console.log('Keeping Old co-ords');
                        console.log(response.lat);
                        resolve(response);
                    }
                }
            });


        }
    });

});



var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};

angularApp.directive("compareTo", compareTo);


angularApp.config(function($routeProvider)
{

    $routeProvider.
        when('/signup', {
            templateUrl: 'partials/signup.html',
            css: 'css/signup.css',
            controller: 'SignupController'
        }).
        when('/', {
            templateUrl: 'partials/dashboard.html',
            controller: 'DashboardController',
            css: 'css/dashboard.css'
        }).
        when('/login', {
            templateUrl: 'partials/login.html',
            css: 'css/login.css',
            controller: 'LoginController'
        }).
        when('/set-preferences', {
            templateUrl: 'partials/set-preferences.html',
            css: 'css/set-preferences.css',
            controller: 'SetPreferencesController'
        }).
        when('/profile', {
            templateUrl: 'partials/profile.html',
            css: 'css/profile.css',
            controller: 'ProfileController'
        }).
        when('/event/:id/:lat/:lon', {
            templateUrl: 'partials/event.html',
            css: 'css/dashboard.css',
            controller: 'EventController'
        }).
        otherwise({
            redirectTo: '/'
        });


});








