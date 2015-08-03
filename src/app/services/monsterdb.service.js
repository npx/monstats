/**
 * Handling the Monster information
 */
(function() {
    'use strict';

    angular
        .module('monstats.services')
        .factory('MonsterDB', MonsterDB);

    MonsterDB.$inject = ['$q', '$http'];

    function MonsterDB($q, $http) {
        var service = {
            load      : load,
            forceLoad : loadFromServer
        };

        return service;

        ////////////

        /**
         * check if local storage is supported in the client's browser
         */
        function lsAvailable() {
            try {
                return 'localStorage' in window && window.localStorage !== null;
            } catch(e){
                return false;
            }
        }

        /**
         * store monsters in local storage if available
         */
        function storeMonsters(monsters) {
            if (lsAvailable()) {
                var time = Math.floor(Date.now() / 1000);
                localStorage.setItem('monsters', JSON.stringify(monsters));
                localStorage.setItem('cachedOn', time);
            }
        }

        /**
         * try to load monster data from local storage if possible
         */
        function loadFromCache() {
            var deferred = $q.defer();

            if (!lsAvailable()) {
                deferred.reject('HTML5 localstorage not supported');
                return deferred.promise;
            }

            var monsters = localStorage.getItem('monsters');
            var cached = localStorage.getItem('cachedOn');
            if (monsters && cached) {
                var res = { monsters: JSON.parse(monsters), cached: parseInt(cached) };
                deferred.resolve(res);
            } else {
                deferred.reject('Nothing in cache, yet');
            }

            return deferred.promise;
        }

        /**
         * try to load monster data from server
         */
        function loadFromServer() {
            return $http.get('data/monsters.min.json').
                // on success, try to cache
                success(function(res) { storeMonsters(res); }).
                then(function(res){ return { monsters: res.data }; });
        }

        /**
         * expose loading of monster in service
         */
        function load() {
            function onSuccess(res) { return res; }
            function onError(err) { return loadFromServer(); }

            return loadFromCache().then(onSuccess, onError);
        }
    }
}());
