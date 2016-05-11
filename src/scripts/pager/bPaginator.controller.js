(function() {
  'use strict';

  angular
    .module('bTable')
    .controller('bPaginatorController', bPaginatorController);

  bPaginatorController.$inject = ['$log', '$scope'];

  function bPaginatorController($log, $scope) {
    var vm = this;

    activate();

    function activate() {
      $log.debug('bPaginatorController activated!');
      if (!vm.model.dataDsp) {
        var dataDsp = angular.copy(vm.model.data);
        vm.model.dataDsp = dataDsp;
      }
    }

    $scope.$watch(function() {
      return vm.model.dataDsp;
    }, function(data) {
      vm.model.dataDsp = angular.copy(data);
      $scope.displayPage = vm.model.pager.currentPage;
    }, true);
  }
})();
