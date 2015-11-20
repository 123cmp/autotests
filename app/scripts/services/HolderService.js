angular.module("App").factory('HolderService', ['$q', function ($q) {

    var loaders = 0,
        message = "",
        subscriber = null;

    function getMessage() {
        return message;
    }

    function getLoaders() {
        return loaders;
    }

    function setMessage(newMessage) {
        message = newMessage;
    }

    function subscribe(callback) {
        subscriber = callback;
    }

    function addLoader() {
        loaders ++;
        if(subscriber) subscriber(loaders)
    }

    function removeLoader() {
        loaders --;
        if(subscriber)subscriber(loaders)
    }

    return {
        subscribe: subscribe,
        addLoader: addLoader,
        removeLoader: removeLoader,
        setMessage: setMessage,
        getMessage: getMessage,
        getLoaders: getLoaders
    };

}]);

