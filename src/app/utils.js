/**
 * Monstats - Utilities
 */
(function() {
    'use strict';

    angular
        .module('monstats.utils', [])
        .directive('preventDefault', preventDefault)
        .filter('byName', byName);

    function preventDefault() {
        return linkFunc;

        function linkFunc(scope, el, attr) {
            angular.element(el).bind('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    }

    function byName() {
        return filter;

        function filter(monsters, q) {
            if ((!(monsters)) || (!(q)) || (q.length < 3))
                return [];
            return monsters.filter(function(m) {
                return m.name.toLowerCase().indexOf(q.toLowerCase()) > -1;
            });
        }
    }
})();
