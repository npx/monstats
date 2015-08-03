angular.module('monstats.services').



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
