angular.module("App").directive('spoiler', [function() {
    return {
        restrict: "E",
        scope: {
           array: "="
        },
        templateUrl: 'app/views/directives/spoiler.html',
        link: function(scope, element, attrs) {
            scope.expand = false;
            scope.title = attrs.title;
            scope.label = attrs.label;
            scope.toggleSpoiler = function() {
                scope.expand = !scope.expand;
            };
        }
    }
}]);