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
