angular.module("App").factory('ReportStorage', [function () {

    return ReportStorage;

    function ReportStorage() {
        var reports = [];

        function push(result) {
            reports.push(result);
        }

        function clear() {
            reports = [];
        }

        function get() {
            return reports;
        }

        return {
            push: push,
            get: get,
            clear: clear
        }
    }
}]);

