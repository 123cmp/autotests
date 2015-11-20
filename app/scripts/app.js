angular.module('App', [
    'ui.router'
]).config(function($stateProvider) {
    console.log("state");
    $stateProvider
        .state('main', {
            url: "",
            templateUrl: "app/views/mainPage.html",
            controller: 'MainPageCtrl'
        });
});