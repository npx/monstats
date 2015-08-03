/**
 * The Monstats App
 *
 * @author npx 2015
 */
(function() {
    'use strict';

    angular
        .module('Monstats', [
            'monstats.graph',
            'monstats.services',
            'monstats.utils'
        ]);
})();

/**
 * Monstats - Graph
 */
(function() {
    'use strict';

    angular
        .module('monstats.graph', [
            'monstats.services'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('monstats.services', []);
})();

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

/**
 * Monstats - Graph (Directive)

 * Directive that paints a growth graph for a given list of monsters
 */
(function() {
    'use strict';

    angular
        .module('monstats.graph')
        .directive('monsterGraph', monsterGraph)
        .directive('serie', serie);

    function monsterGraph() {
        var directive =  {
            restrict: 'E',
            controller: GraphController,
            controllerAs: 'vm',
            bindToController: true,
            template:
                '<div>' +
                '  <div></div>' +
                '  <serie ng-repeat="mon in vm.monsters" monster="mon" />' +
                '</div>',
            scope: { monsters: '=', stat: '@' },
            replace: true,
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, el, attr, ctrl) {
            if ('stat' in attr)
                ctrl.setStat(attr.stat);
            ctrl.setupChart(el[0].children[0]);
        }
    }

    function serie() {
        var directive =  {
            restrict: 'E',
            require: '^monsterGraph',
            scope: { monster: '=' },
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, el, attr, GraphControl) {
            GraphControl.addSerie(scope.monster);

            scope.$on('$destroy', function() {
                GraphControl.removeSerie(scope.monster);
            });
        }
    }

    GraphController.$inject = ['Growth'];

    function GraphController(Growth) {
        var vm = this;

        var series = [];
        var stat = Growth.types[0];
        var chart = null;

        vm.addSerie = addSerie;
        vm.removeSerie = removeSerie;
        vm.setStat = setStat;
        vm.setupChart = setupChart;

        ////////////

        function addSerie(monster) {
            var index = series.indexOf(monster);
            if (index >= 0) return;
            series.push(monster);

            var s = {};
            s.id = monster.id;
            s.name = monster.name;
            s.data = Growth.computeGraph(monster, stat);
            chart.addSeries(s);
        }

        function removeSerie(monster) {
            var index = series.indexOf(monster);
            if (index >= 0)
                series.splice(index, 1);
            var serie = chart.get(monster.id);
            if (serie) serie.remove();
        }

        function setStat(s) {
            if (Growth.isValidType(s))
                stat = s;
        }

        function setupChart(target) {
            // configure the chart
            var xlabels = [];
            for (var i = 1; i < 100; i++) { xlabels.push(''+i); }

            chart = new Highcharts.Chart({
                chart: { renderTo: target },
                title: { text: '', },
                xAxis: { categories: xlabels },
                yAxis: { title: { text: '' } },
                plotOptions: {
                    series: {
                        marker: { enabled: false }
                    }
                },
                tooltip: { shared: true },
                legend: {
                    labelFormatter: function () { return this.name; },
                    layout: 'vertical',
                    itemMarginTop: 1,
                    itemMarginBottom: 1,
                    verticalAlign: 'top'
                },
                credits: false
            });
        }
    }
})();

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
