(function() {

  angular
    .module('bTable')
    .controller('bTableController', bTableController);

  bTableController.$inject = ['$log', '$scope', '$q', 'limitToFilter'];

  function bTableController($log, $scope, $q, limitToFilter) {
    var vm = this;

    activate();

    function activate() {
      $log.debug('bTableController activated');

      if (!vm.model.dataDsp) {
        var dataDsp = angular.copy(vm.model.data);
        vm.model.dataDsp = dataDsp;
      }
      //vm.modelDsp = {
      //  data: vm.model.data
      //};
      //vm.modelDsp.data = vm.model.dataDsp;
      //vm.modelDsp = bModelService.getModel();

      if (!vm.model.sorter) {
        vm.model.sorter = {};
      }

      if (!vm.model.pager) {
        vm.model.pager = {};
      }

      if (!vm.model.pager.currentPage) {
        vm.model.pager.currentPage = 0;
      }

      if (!vm.model.searcher) {
        vm.model.searcher = {};
      }

      $scope.$watch(function() {
        return vm.model.data;
      }, function(data) {
        vm.model.dataDsp = angular.copy(data);
      }, true);

      $scope.$watch(function() {
        return vm.model.pager.currentPage;
      }, function(newPage, oldPage) {
        if (newPage != oldPage) {
          bindData();
        }
      });

      function bindData() {
        var model = vm.model;

        if (!model && model.pager) {
          return;
        }

        if (model.events && model.events.onPageChange &&
          _.isFunction(model.events.onPageChange)) {
          var promises = [model.events.onPageChange()];
          return $q.all(promises)
            .then(function() {
              model.pager.isPageChanged = true;
              model.dataDsp = angular.copy(model.data);
            });
        } else {
          var offset = model.pager.itemsPerPage * model.pager.currentPage;
          model.dataDsp = limitToFilter(model.data,
            model.pager.itemsPerPage, offset);
          model.sorter.isPageChanged = true;
        }
      }
    }
  }
})();
