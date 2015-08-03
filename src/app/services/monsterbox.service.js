/**
 * Box of Monsters that will be compared
 */
(function() {
    'use strict';

    angular
        .module('monstats.services')
        .factory('MonsterBox', MonsterBox);

    MonsterBox.$inject = [];

    function MonsterBox() {
        var monsters = [];

        var service = {
            monsters: monsters,
            add : add,
            del : del
        };

        return service;

        ////////////

        function add(monster) {
            if (monsters.indexOf(monster) < 0)
                monsters.push(monster);
        }

        function del(monster) {
            var idx = monsters.indexOf(monster);
            if (idx > -1)
                monsters.splice(idx, 1);
        }
    }
}());
