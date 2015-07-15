var whiteStats = ['atk', 'hp', 'rcv'];

function growth(Lv, min, max, maxLv, g) {
  return (min + (max - min) * Math.pow((Lv - 1) / (maxLv - 1), g));
}

function monster2graph(monster, stat) {
  if (whiteStats.indexOf(stat) < 0) return [];

  var stats = [];

  var maxLv = monster.max_level;
  var min = monster[stat + "_min"];
  var max = monster[stat + "_max"];
  var scale = monster[stat + "_scale"];

  for (var i = 1; i < (maxLv + 1); i++) {
    stats.push(growth(i, min, max, maxLv, scale));
  }

  return stats;
}

angular.module('App', []).

controller('Main', function($scope, $http) {
  $scope.store = {
    monsters: [],
    selected: []
  };

  $scope.addMonster = function(monster) {
    if ($scope.store.selected.indexOf(monster) < 0)
      $scope.store.selected.push(monster);
  };

  $scope.delMonster = function(monster) {
    var idx = $scope.store.selected.indexOf(monster);
    if (idx > -1)
      $scope.store.selected.splice(idx, 1);
  };

  var loadMonsters = function() {
    console.log("start loading monsters...");

    $http.get('/data/monsters.min.json').

      error(function(err, code) {
        console.log(code, "Cannot load monsters...", err);
      }).

      then(function(res) {
        $scope.store.monsters = res.data.filter(function(monster) {
          return (monster.name.indexOf("Shiva") > -1);
        });
      });
  };

  loadMonsters();
}).

directive('statGraph', function() {
  return {
    restrict: 'A',
    scope: { data: '=statGraph', stat: '@' },
    template: '<div id="container" style="height: 300px"></div>',
    link: function(scope, element, attrs) {
      // set type of stat
      var stat = whiteStats[0];
      if (('stat' in attrs) && (whiteStats.indexOf(attrs.stat) > -1))
        stat = attrs.stat;


      // watch for changes in data
      scope.$watchCollection('data', function(monsters) {
        if ((monsters) && (monsters.length > 0)) {
          drawChart(monsters);
        }
      });

      var drawChart = function (monsters) {
        console.log("draw...");
        var xlabels = [];
        for (var i = 1; i < 100; i++) { xlabels.push(""+i); }

        var monster = monsters[0];

        var myLineChart = new Highcharts.Chart({
          chart: {
            renderTo: 'container',
          },
          title: {
            text: 'Monthly Average Temperature',
            x: -20 //center
          },
          subtitle: {
            text: 'Source: WorldClimate.com',
            x: -20
          },
          xAxis: {
            categories: xlabels
          },
          yAxis: {
            title: {
              text: stat
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },
          tooltip: {},
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
          },
          series: [{
            name: 'Tokyo',
            data: monster2graph(monster, stat)
          }]
        });
      };
    }
  };
});
