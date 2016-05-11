(function() {

  angular
    .module('bTable')
    .directive('bSort', bSortDirective);

  bSortDirective.$inject = ['$log', '$q', 'orderByFilter'];
  function bSortDirective($log, $q, orderByFilter) {
    return {
      compile: bSortCompile,
      require: '^bTable',
      restrict: 'A',
      scope: true,
      template: getTemplate,
      transclude: true,
    };

    function bSortCompile(el, attr, transclude) {
      $log.debug('bSortCompile activated!');
      return {
        post: bSortLink
      };
    }

    function bSortLink(scope, el, attr, ctrl, transclude) {
      $log.debug('bSortLink activated!');
      var predicate = attr.bSort;
      var sorter = ctrl.model.sorter;
      scope.sort = sort;

      scope.$watch(function() {
        return ctrl.model.sorter;
      }, function(sorter) {
        updateCss(scope, predicate, sorter);
      }, true);

      function sort() {
        var predicate = attr.bSort;
        if (!ctrl.model.sorter) {
          ctrl.model.sorter = {};
        }
        var sorter = ctrl.model.sorter;
        var model = ctrl.model;

        sorter.isSort = false;
        if (sorter.predicate === predicate) {
          sorter.reverse = !sorter.reverse;
        } else {
          sorter.predicate = predicate;
          sorter.reverse = false;
        }

        if (model.pager && model.pager.currentPage) {
          model.pager.currentPage = 0;
        }

        if (model.events && model.events.onSort &&
            _.isFunction(model.events.onSort)) {
          var promises = [model.events.onSort()];
          return $q.all(promises).then(function() {
            model.sorter.isSort = true;
            model.dataDsp = angular.copy(model.data);
          });
        } else {
          model.data = orderByFilter(model.data,
              sorter.predicate, sorter.reverse);
          sorter.isSort = true;
        }
      }
    }

    function getTemplate() {
      var template = '';

      template +=
        '<span class="hand" ng-click="sort()">' +
        '<span ng-transclude></span>' +
        '<i class="fa {{cssClass}}" style="padding-left: 5px;"></i></span>';

      return template;
    }

    function updateCss(scope, predicate, sorter) {
      scope.cssClass = '';

      if (sorter && predicate === sorter.predicate) {
        if (sorter.reverse) {
          scope.cssClass = 'fa-chevron-down';
        } else {
          scope.cssClass = 'fa-chevron-up';
        }
      }
    }
  }
})();
