angular.module("App").controller('MainPageCtrl', ['$scope', 'ApiParser', 'Tester', 'ReportStorage', '$q', 'ReportFactory', 'Config', 'HolderService',
    function ($scope, ApiParser, Tester, ReportStorage, $q, ReportFactory, Config, HolderService) {
        $scope.results = [];

        var parser = new ApiParser(),
            tester = new Tester(),
            reportsStorage = new ReportStorage();



        parser.parse(Config.wadl).then(function (data) {
            tester.doLogin(data.login).then(function (result) {
                    var report = ReportFactory.makeReport("Login", data.login, result, {isValid: true, message: ""});
                    reportsStorage.push(report);
                    makeTests(data);
                },
                function (error) {
                    console.log(error);
                    var report = ReportFactory.makeReport("Login", data.login, error,
                        {isValid: false, message: error.message, trace: error.data.exception_trace, traceMessage: error.data.exception_message});
                    reportsStorage.push(report);
                }
            ).finally(function () {
                    $scope.results = reportsStorage.get();
                }
            );
        });

        function makeTests(data) {
            HolderService.setMessage("Testing of requests");
            HolderService.addLoader();
            var promises = tester.testArrayOf('GET', data.GET);
            promises = promises.concat(tester.testArrayOf('POST', data.POST));
            $q.all(promises).then(function (reports) {
                angular.forEach(reports, function (report) {
                    reportsStorage.push(report);
                });
                onTestsEnds(data);
            });
        }

        function onTestsEnds(data) {
            HolderService.removeLoader();
            tester.doLogout(data.logout).then(function (result) {
                    var report = ReportFactory.makeReport("Logout", data.logout, result, {isValid: true, message: ""});
                    reportsStorage.push(report);
                },
                function (error) {
                    var report = ReportFactory.makeReport("Logout", data.logout, error,
                        {isValid: false, message: error.message, trace: error.data.exception_trace, traceMessage: error.data.exception_message});
                    reportsStorage.push(report);
                })
                .finally(function () {
                        $scope.results = reportsStorage.get();
                    }
                );
        }

    }]);