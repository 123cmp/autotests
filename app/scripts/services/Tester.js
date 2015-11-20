angular.module("App").factory('Tester', ['$http', '$q', 'Config', 'ReportFactory', 'HolderService',
    function ($http, $q, Config, ReportFactory, HolderService) {

    return Tester;

    function Tester() {
        var apiKey = 0;

        function doLogin(request) {
            HolderService.setMessage("Sending login request");
            HolderService.addLoader();
            var dfd = $q.defer();
            var predefined = {
                'password': Config.password
            };
            predefined[Config.loginField] = Config.login;
            var promise = doRequest(request, predefined);
            promise.then(function (result) {
                    apiKey = result.data.data.token.key;
                    dfd.resolve(result);
                },
                function (error) {
                    dfd.reject(error);
                    throw error;
                })
                .finally(function() {
                    HolderService.removeLoader();
            });

            return dfd.promise;
        }

        function doLogout(request) {
            HolderService.setMessage("Sending logout request");
            HolderService.addLoader();
            var promise = doRequest(request);
            promise.finally(function() {
                HolderService.removeLoader();
            });
            return promise
        }

        function doRequest(request, predefined) {
            var data = {},
                headers = {};
            if (!predefined) predefined = {};
            if (apiKey) predefined['api-key'] = apiKey;
            angular.forEach(request.params, function (param, i) {
                angular.forEach(predefined, function (predef, name) {
                    if (param.name == name) {
                        param.style == "query" ? data[param.name] = predef : headers[param.name] = predef;
                    }
                });
            });

            return $http({
                method: request.method,
                url: request.url,
                data: data,
                headers: headers
            });
        }

        function getRequestHandler(type) {
            var requestHandler = null;
            switch (type) {
                case 'GET':
                    requestHandler = testGetRequest;
                    break;
                case 'POST':
                    requestHandler = testPostRequest;
                    break;
                case 'PUT':
                    requestHandler = testPutRequest;
                    break;
                case 'DELETE':
                    requestHandler = testDeleteRequest;
                    break;
                default:
                    requestHandler = testGetRequest;
            }
            return requestHandler;
        }

        function testArrayOf(type, array) {
            var promises = [];
            angular.forEach(array, function (request) {
                promises.push(getRequestHandler(type)(request));
            });

            return promises;
        }

        function modifyUrl(url) {
            if(url.endsWith("_id")) {
                url = url.replace(/\/[^\/]+_id/g, "/" + Config.int);
            }
            return url;
        }

        function getPredefinedFor(type) {
            var value = "test";
            switch (type) {
                case 'xsd:string':
                case 'varchar':
                    value = Config.varchar; break;
                case 'int':
                    value = Config.int; break;
                case 'datatime':
                    value = Config.datatime; break;
            }
            return value;
        }

        function testGetRequest(request) {
            request.method = 'GET';
            request.url = modifyUrl(request.url);
            var dfd = $q.defer(),
                promise = doRequest(request);
            promise.then(function (response) {
                    var testResult = analysisGetResult(response, request);
                    var report = ReportFactory.makeReport(request.name, request, response, testResult);
                    dfd.resolve(report);
                },
                function (error) {
                    var testResult = analysisGetResult(error, request);
                    var report = ReportFactory.makeReport(request.name, request, error, testResult);
                    dfd.resolve(report);
                });

            return dfd.promise;
        }



        function testPostRequest(request) {
            request.method = 'POST';
            var fieldList = request.fields ? request.fields : request.params;
            var predefinedValues = {};
            angular.forEach(fieldList, function(value) {
                predefinedValues[value.name] = getPredefinedFor(value.type);
            });
            console.log(predefinedValues);
            var dfd = $q.defer(),
                promise = doRequest(request, predefinedValues);
            promise.then(function (response) {
                    var testResult = analysisPostResult(response);
                    var report = ReportFactory.makeReport(request.name, request, response, testResult);
                    dfd.resolve(report);
                },
                function (error) {
                    var testResult = analysisPostResult(error);
                    var report = ReportFactory.makeReport(request.name, request, error, testResult);
                    dfd.resolve(report);
                });

            return dfd.promise;
        }

        function testPutRequest(request) {

        }

        function testDeleteRequest(request) {

        }

        function analysisGetResult(result, request) {
            var testResult = {isValid: true, message: "", trace: ""};
            //check status
            console.log(request);
            if(result.status != 200)  {
                testResult.isValid = false;
                testResult.message = "Status of request is invalid. Expected 200 but got " + result.status + ".";
                testResult.trace = result.data.exception_trace;
                testResult.traceMessage = result.data.exception_message;
            }
            //check answer for empty
            else if(!result.data.data || (angular.isObject(result.data.data) && angular.isEmptyObject(result.data.data)) ||
                (angular.isArray(result.data.data) && angular.isEmpty(result.data.data))) {
                testResult.isValid = false;
                testResult.message = "Unexpected empty data.";
                testResult.trace = result.data.exception_trace;
                testResult.traceMessage = result.data.exception_message;
            }

            else if(!isValidJson(result.data)) {
                testResult.isValid = false;
                testResult.message = "Expected JSON. but got string.";
                testResult.trace = result.data;
            }

            else {

                angular.forEach(result.data.data, function(val, name) {
                    console.info(val, name);
                    if(val === null || (angular.isArray(val) && angular.isEmptyObject(val)) ) {
                        testResult.isValid = false;
                        testResult.message = "Empty data received";
                        //testResult.trace = result.data;
                    }
                    console.info(testResult.isValid)
                });
            }

            return testResult;
        }

        function analysisPostResult(result) {
            var testResult = {isValid: true, message: "", trace: ""};
            //check status
            if(result.status != 200)  {
                testResult.isValid = false;
                testResult.message = "Status of request is invalid. Expected 200 but got " + result.status + ".";
                testResult.trace = result.data.exception_trace;
                testResult.traceMessage = result.data.exception_message;
            }
            //check answer for empty
            else if(!result.data || (angular.isObject(result.data) && angular.isEmptyObject(result.data)) ||
                (angular.isArray(result.data) && angular.isEmpty(result.data))) {
                testResult.isValid = false;
                testResult.message = "Unexpected empty data";
                testResult.trace = result.data.exception_trace;
                testResult.traceMessage = result.data.exception_message;
            }

            else if(!isValidJson(result.data)) {
                testResult.isValid = false;
                testResult.message = "Expected JSON. but got string.";
                testResult.trace = result.data;
            }

            return testResult;
        }

        function isValidJson(str) {
            if(!angular.isString(str)) return true;
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        return {
            doLogin: doLogin,
            doLogout: doLogout,
            testArrayOf: testArrayOf,
            testGetRequest: testGetRequest,
            testPostRequest: testPostRequest,
            testPutRequest: testPutRequest,
            testDeleteRequest: testDeleteRequest
        }
    }
}]);

