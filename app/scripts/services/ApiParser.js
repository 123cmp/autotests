angular.module("App").factory('ApiParser', ['$http', '$q', 'Config', 'HolderService', function ($http, $q, Config, HolderService) {

    return ApiParser;

    function ApiParser() {
        var data = {
            GET: {},
            POST: {},
            DELETE: {},
            PUT: {},
            login: {},
            logout: {}
        };

        function parse(url) {
            var dfd = new $q.defer();
            HolderService.setMessage("Loading wadl-file");
            HolderService.addLoader();

            console.log("addLoader", parent['@wsdl']);
            $http.get(url).then(function (evt) {
                var oParser = new DOMParser();
                var xml = oParser.parseFromString(evt.data, "text/xml");
                var json = JSON.parse(xml2json(xml).replace(/undefined/g, ""));
                var base = json.application.resources['@base'];
                var promises = [];
                angular.forEach(json.application.resources.resource, function (parent, n) {
                    if (!angular.isArray(parent.resource))
                        parent.resource = [parent.resource];
                    var defer = $q.defer();
                    if(!parent['@wsdl'].endsWith("/?wsdl")) {
                        var promise = $http.get(parent['@wsdl']);
                        HolderService.setMessage("Loading resource wadl-files");
                        HolderService.addLoader();
                        promise.then(function(result) {
                            parent.fields = result.data.fields;
                            defer.resolve(result);
                        }).finally(function() {
                            HolderService.removeLoader();
                        });
                    } else {
                        defer.resolve(data);
                    }
                    promises.push(defer.promise);
                    defer.promise.then(function() {
                        angular.forEach(parent.resource, function (resource, i) {
                            var params = [];
                            if (!resource['@postman:name'])
                                resource['@postman:name'] = parent['@postman:name'];
                            if (!angular.isArray(resource.method.request.param))
                                resource.method.request.param = [resource.method.request.param];

                            angular.forEach(resource.method.request.param, function (param) {
                                params.push({
                                    name: param['@name'],
                                    type: param['@type'],
                                    style: param['@style']
                                });
                            });

                            promises.push(defer.promise);
                            addRequest(base, parent, resource, params, parent.fields);
                        });
                    })
                });

                $q.all(promises).then(function() {
                    dfd.resolve(data);
                });

            }).finally(function() {
                HolderService.removeLoader();
            });

            return dfd.promise;
        }

        function addRequest(base, parent, resource, params, fields) {
            if(resource['@postman:name'] == Config.authRequest) {
                data.login = {
                    url: base + "/" + parent['@path'] + "/" + resource['@path'],
                    params: params,
                    method: resource.method['@name'],
                    name: resource['@postman:name']
                }
            } else if (resource['@postman:name'] == Config.logoutRequest) {
                data.logout = {
                    url: base + "/" + parent['@path'] + "/" + resource['@path'],
                    params: params,
                    method: resource.method['@name'],
                    name: resource['@postman:name']
                }
            } else {
                data[resource.method['@name']][resource['@postman:name']] = {
                    url: base + "/" + parent['@path'] + "/" + resource['@path'],
                    params: params,
                    name: resource['@postman:name'],
                    fields: fields
                }
            }
        }

        return {
            parse: parse
        }
    }
}]);

