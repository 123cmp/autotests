angular.module("App").directive('holder', ['HolderService', function(HolderService) {
    return {
        restrict: "E",
        templateUrl: 'app/views/directives/holder.html',
        link: function(scope, element, attrs) {
            HolderService.subscribe(update);
            update(HolderService.getLoaders() > 0);
            function update(count) {
                scope.show = (count > 0);
                scope.message = HolderService.getMessage();
            }
        }
    }
}]);