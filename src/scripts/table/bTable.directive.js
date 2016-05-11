(function() {
  angular
     .module('bTable')
     .directive('bTable', bTableDirective);

  bTableDirective.$inject = ['$log'];
  function bTableDirective($log) {
    return {
      bindToController: true,
      controller: 'bTableController',
      controllerAs: 'vm',
      link: bTableLink,
      restrict: 'A',
      scope: {
        model: '='
      }
    };

    function bTableLink(scope, el, attr, ctrl) {
      $log.debug('bTableLink activated!');
      el.addClass('table');
      el.addClass('table-striped');
    }
  }
})();
