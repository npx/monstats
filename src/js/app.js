angular.module('App', []).

controller('Main', function($scope, $http) {
  $scope.store = {
    monsters: [],
    selected: [],
    search: "",
    loading: true
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
    $http.get('data/monsters.min.json').

      error(function(err, code) {
        alert(code, "Cannot load monsters...", err);
      }).

      then(function(res) {
        $scope.store.monsters = res.data;
        $scope.store.loading = false;
      });
  };

  loadMonsters();
}).


// TODO keep track of series and dynamically add and remove them
directive('monsterGraph', function(Growth) {
  return {
    restrict: 'E',
    scope: { data: '=monsters', stat: '@' },
    template: '<div></div>',
    replace: true,
    link: function(scope, element, attrs) {
      // set type of stat
      var stat = Growth.types[0];
      if (('stat' in attrs) && (Growth.isValidType(attrs.stat)))
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
          s.data = Growth.computeGraph(monster, stat);
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


/**
 * Growth computation Service
 */
service('Growth', function() {
  // the growth function
  var growthFunction = function (Lv, min, max, maxLv, g) {
    return Math.round(min + (max - min) * Math.pow((Lv - 1) / (maxLv - 1), g));
  };

  // types of growth
  this.types = ['atk', 'hp', 'rcv'];

  this.isValidType = function(stype) {
    return this.types.indexOf(stype) >= 0;
  };

  // compute the graph for the given monster and selected stat
  this.computeGraph = function(monster, stype) {
    // sanitize
    if (!this.isValidType(stype)) {
      console.log("Error: illegal stat type", stype);
      return [];
    }

    // monster info
    var maxLv = monster.max_level;
    var min = monster[stype + "_min"];
    var max = monster[stype + "_max"];
    var scale = monster[stype + "_scale"];

    // compute stat for all levels the monster can have
    var stats = [];
    for (var i = 1; i < (maxLv + 1); i++) {
      stats.push(growthFunction(i, min, max, maxLv, scale));
    }

    // return the serie
    return stats;
  };
}).


/**
 * Utilities
 */
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
