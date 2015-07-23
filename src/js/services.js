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
