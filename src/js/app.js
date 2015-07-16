var whiteStats = ['atk', 'hp', 'rcv'];

function growth(Lv, min, max, maxLv, g) {
  return Math.round(min + (max - min) * Math.pow((Lv - 1) / (maxLv - 1), g));
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
    selected: [],
    search: ""
  };

  $scope.addMonster = function(monster) {
    if ($scope.store.selected.indexOf(monster) < 0) {
      $scope.store.selected.push(monster);
      $scope.store.search = "";
    }
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
        $scope.store.monsters = res.data;
      });
  };

  loadMonsters();
}).

directive('monsterGraph', function() {
  return {
    restrict: 'E',
    scope: { data: '=monsters', stat: '@' },
    template: '<div></div>',
    replace: true,
    link: function(scope, element, attrs) {
      // set type of stat
      var stat = whiteStats[0];
      if (('stat' in attrs) && (whiteStats.indexOf(attrs.stat) > -1))
        stat = attrs.stat;


      // configure the chart
      var canvas = element[0];
      var xlabels = [];
      for (var i = 1; i < 100; i++) { xlabels.push(""+i); }
      var chart = new Highcharts.Chart({
        chart: { renderTo: canvas },
        title: { text: '', },
        xAxis: { categories: xlabels },
        yAxis: {
          title: { text: "" },
          plotLines: [
            { value: 0, width: 1, color: '#808080' },
            { value: 0, width: 1, color: '#FF0000' }
          ]
        },
        plotOptions: {
          series: {
            marker: { enabled: false }
          }
        },
        tooltip: {
          // formatter: function() {
          //     var s = [];
          //
          //     angular.forEach(this.points, function(point) {
          //       s.push('<span style="color:#D31B22;font-weight:bold;">'+ point.series.name +' : '+ point.y +'</span>');
          //     });
          //
          //     return s.join('<br/>');
          // },
          shared: true
        },
        legend: {
          labelFormatter: function () {
            return this.name + " <em>x</em>";
          },
          layout: "vertical",
          itemMarginTop: 1,
          itemMarginBottom: 1,
          verticalAlign: "top"
        },
        series: [],
        credits: false
      });


      var drawChart = function (monsters) {
        while(chart.series.length > 0)
          chart.series[0].remove(true);

        angular.forEach(monsters, function(monster){
          var s = {};
          s.name = monster.name;
          s.data = monster2graph(monster, stat);
          chart.addSeries(s, false);
        });
        chart.redraw();
      };


      // get the canvas
      // watch for changes in data
      scope.$watchCollection('data', function(monsters) {
        if ((monsters) && (monsters.length > 0)) {
          drawChart(monsters);
        }
      });

    }  // link function end
  };
}).

directive('preventDefault', function() {
    return function(scope, element, attrs) {
        angular.element(element).bind('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
    };
}).

filter('byName', function() {
  return function(monsters, q) {
    if ((!(monsters)) || (!(q)) || (q.length < 3))
      return [];
    return monsters.filter(function(m) {
      return m.name.toLowerCase().indexOf(q.toLowerCase()) > -1;
    });
  };
});
