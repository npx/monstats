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
