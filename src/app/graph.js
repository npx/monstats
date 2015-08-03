/**
 * Monstats - Graph
 */
angular.module('monstats.graph', ['monstats.services']).


/**
 * Directive that paints a growth graph for a given list of monsters
 */
controller("GraphControl", ['$scope', 'Growth', function($scope, Growth) {
  var series = [];
  var stat = Growth.types[0];
  var chart = null;

  this.setStat = function(s) {
    if (Growth.isValidType(s))
      stat = s;
  };

  this.setupChart = function(target) {
    // configure the chart
    var xlabels = [];
    for (var i = 1; i < 100; i++) { xlabels.push(""+i); }

    chart = new Highcharts.Chart({
      chart: { renderTo: target },
      title: { text: '', },
      xAxis: { categories: xlabels },
      yAxis: { title: { text: "" } },
      plotOptions: {
        series: {
          marker: { enabled: false }
        }
      },
      tooltip: { shared: true },
      legend: {
        labelFormatter: function () { return this.name; },
        layout: "vertical",
        itemMarginTop: 1,
        itemMarginBottom: 1,
        verticalAlign: "top"
      },
      credits: false
    });
  };

  this.addSerie = function(monster) {
    var index = series.indexOf(monster);
    if (index >= 0) return;
    series.push(monster);

    var s = {};
    s.id = monster.id;
    s.name = monster.name;
    s.data = Growth.computeGraph(monster, stat);
    chart.addSeries(s);
  };

  this.removeSerie = function(monster) {
    var index = series.indexOf(monster);
    if (index >= 0)
      series.splice(index, 1);
    var serie = chart.get(monster.id);
    if (serie) serie.remove();
  };
}]).

directive("monsterGraph", [function() {
  return {
    restrict: 'E',
    controller: 'GraphControl',
    scope: { monsters: '=', stat: '@' },
    replace: true,
    template: '<div>'+
              '  <div></div>'+
              '  <serie ng-repeat="monster in monsters" monster="monster" />'+
              '</div>',
    link: function (scope, element, attrs, ctrl) {
      if ('stat' in attrs)
        ctrl.setStat(attrs.stat);
      ctrl.setupChart(element[0].children[0]);
    }
  };
}]).

directive("serie", [function() {
  return {
    restrict: "E",
    require: "^monsterGraph",
    scope: { monster: "=" },
    link: function (scope, element, attrs, GraphControl) {
      GraphControl.addSerie(scope.monster);

      scope.$on('$destroy', function() {
        GraphControl.removeSerie(scope.monster);
      });
    }
  };
}]);
