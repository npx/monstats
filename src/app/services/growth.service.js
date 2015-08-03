/**
 * Growth computation Service
 */
(function() {
    'use strict';

    angular
        .module('monstats.services')
        .factory('Growth', Growth);

    Growth.$inject = [];

    function Growth() {
        var types = ['atk', 'hp', 'rcv'];
        var service = {
            types        : types,
            isValidType  : isValidType,
            computeGraph : computeGraph
        };

        return service;

        ////////////

        /**
         * the growth function
         */
        function growthFunction(Lv, min, max, maxLv, g) {
            var val = min + (max - min) * Math.pow((Lv - 1) / (maxLv - 1), g);
            return Math.round(val);
        }

        /**
         * check if given type is in whitelist
         */
        function isValidType(stype) {
            return types.indexOf(stype) >= 0;
        }

        /**
         * compute the graph for the given monster and selected stat
         */
        function computeGraph(monster, stype) {
            // sanitize
            if (!isValidType(stype)) {
                console.log('Error: illegal stat type', stype);
                return [];
            }

            // monster info
            var maxLv = monster.max_level;
            var min = monster[stype + '_min'];
            var max = monster[stype + '_max'];
            var scale = monster[stype + '_scale'];

            // compute stat for all levels the monster can have
            var stats = [];
            for (var i = 1; i < (maxLv + 1); i++) {
                stats.push(growthFunction(i, min, max, maxLv, scale));
            }

            // return the serie
            return stats;
        }
    }
}());
