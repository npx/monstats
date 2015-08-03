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
