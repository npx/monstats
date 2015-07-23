/**
 * Monstats - Graph
 */
angular.module('monstats-graph', ['monstats-services']).


/**
 * Directive that paints a growth graph for a given list of monsters
 */
// TODO keep track of series and dynamically add and remove them
directive('monsterGraph', ['Growth', function(Growth) {
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
}]);
