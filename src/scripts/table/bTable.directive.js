(function() {
  angular
     .module('bTable')
     .directive('bTable', bTableDirective);

  function bTableDirective() {
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
      console.log('bTableLink activated');
      //el.addClass('b-table');
      el.addClass('table');
      el.addClass('table-striped');
    }
  }
})();
