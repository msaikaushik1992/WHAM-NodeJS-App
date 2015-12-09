// MODULE
var angularApp = angular.module('angularApp', ['ngRoute','door3.css','ngCookies', 'ngAutocomplete']);



angularApp.service('webservice',function($http)
{
    var self = this;
    self.getApiData = function (locationObj)
    {
        console.log("/eventsByLocation/"+ JSON.stringify(locationObj));
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

    self.getEventsByLocationAndQuery = function(locationObj, searchParams)
    {
        console.log(searchParams);
        var locationAndQuery={location:locationObj, query:searchParams.query};
        return $http.get("/eventsByLocationAndQuery/"+ JSON.stringify(locationAndQuery));
    }

    self.getEventsByPreferenceAndQLocation = function(preferences, locationObj)
    {
        var categoryList="";
        for(var i=0; i<preferences.length;i++)
        {
            categoryList+=(preferences[i].category)+",";
        }
        categoryList=categoryList.substring(0,categoryList.length-1);
        var PreferencesAndQLocation={categories:categoryList,location:locationObj};
        return $http.get("/eventsByPreferenceAndQLocation/"+ JSON.stringify(PreferencesAndQLocation));
    }

    self.getEventsByQLocation = function(locationObj)
    {
        var queLocation={location:locationObj};
        console.log(queLocation);
        return $http.get("/eventsByQLocation/"+ JSON.stringify(queLocation));
    }

    self.getEventsByQPreference = function(locationObj, searchParams)
    {
        var queLocation={location:locationObj, category:searchParams.category};
        console.log(queLocation);
        return $http.get("/eventsByQLocation/"+ JSON.stringify(queLocation));
    }

    self.getLocationCoordsQuery = function (searchParams) {
        // body...
        var locationObj = {loc:searchParams.loc};
        var val = $http.get("/getLocationCoordsFromCity/"+JSON.stringify(locationObj));
        console.log(val);
        return val;
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
        when('/search', {
            templateUrl: 'partials/search.html',
            css: 'css/dashboard.css',
            controller: 'SearchController'
        }).
        when('/set-preferences', {
            templateUrl: 'partials/set-preferences.html',
            css: 'css/set-preferences.css',
            controller: 'SetPreferencesController',
            resolve: {
                loggedin: function ($q, $timeout, $http, $location, $rootScope) {


                    var deferred = $q.defer();
                    $http.get('/loggedin').success(function (user) {

                        $rootScope.errorMessage = null;
                        if (user !== '0') {
                            $rootScope.currentUser = user;
                            deferred.resolve();
                        }
                        else {

                            $rootScope.errorMessage = 'You need to log in';
                            deferred.reject();
                            $location.url('/login');
                        }
                    });
                },
            }
        }).
        when('/profile',{
            templateUrl: 'partials/profile.html',
            css: 'css/profile.css',
            controller: 'ProfileController',
        resolve: {
            loggedin: function ($q, $timeout, $http, $location, $rootScope) {


                var deferred = $q.defer();
                $http.get('/loggedin').success(function (user) {

                    $rootScope.errorMessage = null;
                    if (user !== '0') {
                        $rootScope.currentUser = user;
                        deferred.resolve();
                    }
                    else {

                        $rootScope.errorMessage = 'You need to log in';
                        deferred.reject();
                        $location.url('/login');
                    }
                });
            },
        }
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








