(function() {

  angular
    .module('bTable')
    .controller('bPaginatorController', bPaginatorController);

  bPaginatorController.$inject = ['$scope'];

  function bPaginatorController($scope) {
    var vm = this;

    activate();

    function activate() {
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
