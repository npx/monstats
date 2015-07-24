/**
 * The Monstats App
 *
 * @author npx 2015
 */
var dependencies = ['monstats-graph', 'monstats-services', 'monstats-utils'];

angular.module('Monstats', dependencies).


/**
 * The Main UI controller
 */
controller('Main', ['$scope', 'MonsterBox', 'MonsterDB',
function($scope, MonsterBox, MonsterDB) {
  // Expose to the scope
  $scope.store = {
    monsters: [],
    search: "",
    selected: MonsterBox.monsters,
    loading: true,
    error: null,
    cached: null
  };


  // Control the MonsterBox
  $scope.addMonster = function(monster) {
    MonsterBox.add(monster);
    $scope.store.search = "";
  };
  $scope.delMonster = function(monster) {
    MonsterBox.del(monster);
  };
  $scope.reload = function() {
    loadMonsters(true);
  };


  // Initialize the MonsterDB
  var loadMonsters = function(force) {
    var store = $scope.store;

    // response handling
    var success = function(res) {
      store.monsters = res.monsters;
      if ('cached' in res) store.cached = res.cached;
    };
    var error = function(err) { store.error = "Cannot load Monster DB :c"; };

    // move
    store.loading = true;
    store.error = null;
    store.cached = null;

    // load normally or force reload
    var loadingMethod = force ? MonsterDB.forceLoad() : MonsterDB.load();

    // attach handlers
    loadingMethod.
      then(success, error).
      finally(function () { store.loading = false; });
  };
  loadMonsters();
}]);

/**
 * Monstats - Graph
 */
angular.module('monstats-graph', ['monstats-services']).


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

angular.module('monstats-services', []).


/**
 * Handling the Monster information
 */
service('MonsterDB', ['$q', '$http', function($q, $http) {
  /**
   * check if local storage is supported in the client's browser
   */
  var lsAvailable = function() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch(e){
      return false;
    }
  };

  /**
   * store monsters in local storage if available
   */
  var storeMonsters = function(monsters) {
    if (lsAvailable()) {
      var time = Math.floor(Date.now() / 1000);
      localStorage.setItem('monsters', JSON.stringify(monsters));
      localStorage.setItem('cachedOn', time);
    }
  };

  /**
   * try to load monster data from local storage if possible
   */
  var loadFromCache = function() {
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
  };

  /**
   * try to load monster data from server
   */
  var loadFromServer = function() {
    return $http.get('data/monsters.min.json').
      // on success, try to cache
      success(function(res) { storeMonsters(res); }).
      then(function(res){ return { monsters: res.data }; });
  };
  // offer method to load from server to refresh cache
  this.forceLoad = loadFromServer;


  /**
   * expose loading of monster in service
   */
  this.load = function() {
    var onSuccess = function(res) { return res; };
    var onError = function(err) { return loadFromServer(); };

    return loadFromCache().then(onSuccess, onError);
  };
}]).


/**
 * The MonsterBox that contains the monsters the stats are computed on
 */
service('MonsterBox', [function() {
  this.monsters = [];

  this.add = function(monster) {
    if (this.monsters.indexOf(monster) < 0)
      this.monsters.push(monster);
  };

  this.del = function(monster) {
    var idx = this.monsters.indexOf(monster);
    if (idx > -1)
      this.monsters.splice(idx, 1);
  };
}]).


/**
 * Growth computation Service
 */
service('Growth', [function() {
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
}]);

/**
 * Monstats - Utilities
 */
angular.module('monstats-utils', []).


directive('preventDefault', [function() {
  return function(scope, element, attrs) {
    angular.element(element).bind('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
    });
  };
}]).


filter('byName', [function() {
  return function(monsters, q) {
    if ((!(monsters)) || (!(q)) || (q.length < 3))
      return [];
    return monsters.filter(function(m) {
      return m.name.toLowerCase().indexOf(q.toLowerCase()) > -1;
    });
  };
}]);
