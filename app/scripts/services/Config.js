angular.module("App").factory('Config', [function () {

    return {
        wadl: "http://athena.dev.firestitch.com/api?wadl",
        login: "admin@admin.com",
        password: "admin",
        loginField: "email",
        int: 1,
        varchar: "test",
        datatime: "2015-01-01",
        authRequest: "Login",
        logoutRequest: "Logout"
    };

}]);

