angular.module("App").factory('ReportFactory', [function () {

    return {
        makeReport: function(name, request, response, testResult) {
            var now = new Date();
            if(testResult.trace) {
                testResult.trace = angular.isString(testResult.trace) ? testResult.trace.split("\n") : testResult.trace;
                testResult.trace = testResult.trace.filter(function(val) { return(val && val.replace(/\s/g, '')) });
            }

            return {
                name: name,
                time: now,
                request: request,
                response: response,
                testResult: testResult
            }
        }
    }

}]);

