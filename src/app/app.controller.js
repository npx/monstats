(function() {
    'use strict';

    angular
        .module('Monstats')
        .controller('AppController', AppController);

    AppController.$inject = ['MonsterBox', 'MonsterDB'];

    function AppController(MonsterBox, MonsterDB) {
        var vm = this;

        // Viewmodel
        vm.cached = null;
        vm.error = null;
        vm.loading = true;
        vm.monsters = [];
        vm.search = '';
        vm.selected = MonsterBox.monsters;

        vm.addMonster = addMonster;
        vm.delMonster = delMonster;
        vm.reload = reload;

        ////////////

        activate();

        function activate() {
            loadMonsters();
        }

        function addMonster(monster) {
            MonsterBox.add(monster);
            vm.search = '';
        }

        function delMonster(monster) {
            MonsterBox.del(monster);
        }

        function loadMonsters(force) {
            // response handling
            function success(res) {
                vm.monsters = res.monsters;
                if ('cached' in res) vm.cached = res.cached;
            }
            function error(err) { vm.error = 'Cannot load Monster DB :c'; }

            // move
            vm.cached = null;
            vm.error = null;
            vm.loading = true;

            // load normally or force reload
            var method = force ? MonsterDB.forceLoad() : MonsterDB.load();

            // attach handlers
            method.
                then(success, error).
                finally(function () { vm.loading = false; });
        }

        function reload() {
          loadMonsters(true);
        }
    }
})();
