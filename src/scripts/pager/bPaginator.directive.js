(function() {

  angular
    .module('bTable')
    .directive('bPaginator', bPaginatorDirective);

  bPaginatorDirective.$inject = ['$log'];

  function bPaginatorDirective($log) {
    return {
      bindToController: true,
      controller: 'bPaginatorController',
      controllerAs: 'vm',
      compile: bPaginatorCompile,
      restrict: 'EA',
      scope: {
        model: '='
      },
      template: getTemplate,
      transclude: true
    };

    function bPaginatorCompile(el, attr, transclude) {
      $log.debug('bPaginatorCompile activated!');
      return {
        pre: bPaginatorPreLink,
        post: bPaginatorPostLink
      };
    }

    function bPaginatorPreLink(scope, el, attr, ctrl) {
      $log.debug('bPaginatorPreLink activated!');
      el.addClass('pagination');
    }

    function bPaginatorPostLink(scope, el, attr, ctrl) {
      $log.debug('bPaginatorPostLink activated!');
      scope.range = [];

      scope.isNextPage = isNextPage;
      scope.isPrevPage = isPrevPage;
      scope.nextPage = nextPage;
      scope.pageCount = pageCount;
      scope.prevPage = prevPage;
      scope.setPage = setPage;

      if (!ctrl.model && !ctrl.model.pager) {
        return;
      }

      var pager = ctrl.model.pager;
      scope.currentPage = pager.currentPage;
      scope.displayPage = scope.currentPage;

      scope.$watch(function() {
        return ctrl.model.data;
      }, function(data) {
        calculateRange(data);
      }, true);

      function calculateRange(data) {
        var rangeSize = 4;
        var start = 0;
        var end;

        scope.range = [];

        var count = pageCount(data);
        if (count > rangeSize) {
          if (pager.currentPage > 0) {
            start = Math.max(start,
              pager.currentPage - Math.floor(rangeSize / 2));
          } else {
            start = pager.currentPage;
          }
          if (start > count - rangeSize) {
            start = count - rangeSize;
          }
          end = Math.min(count, start + rangeSize);
        } else {
          start = 0;
          end = count;
        }

        for (var i = start; i <= end; i++) {
          scope.range.push(i);
        }
      }

      function isNextPage() {
        return pager.currentPage === pageCount() ? 'disabled' : '';
      }

      function isPrevPage() {
        return pager.currentPage === 0 ? 'disabled' : '';
      }

      function nextPage() {
        if (pager.currentPage < pageCount()) {
          pager.currentPage++;
        }
      }

      function pageCount() {
        var data = ctrl.model.data;
        if (pager.pages) {
          return pager.pages - 1;
        } else if (data) {
          return Math.ceil(data.length / pager.itemsPerPage) - 1;
        }
      }

      function prevPage() {
        if (pager.currentPage > 0) {
          pager.currentPage--;
        }
      }

      function setPage(n) {
        pager.currentPage = n;
      }
    }

    function getTemplate(element, attrs) {
      var template = '';

      template +=
        '<ul class="pull-right" ng-if="range.length > 0">' +
        '<li class="padded-r" ng-class="isPrevPage()">' +
        '<a href="javascript:void(0)" ng-click="prevPage()">' +
        '<i class="fa fa-chevron-left"></i></a>' +
        '</li>' +
        '<li class="padded-r" ng-repeat="n in range"' +
        'ng-class="{active: n == displayPage}" ' +
        'ng-click="setPage(n)">' +
        '<a href="javascript:void(0)">{{n+1}}</a>' +
        '</li>' +
        '<li class="padded-r" ng-class="isNextPage()">' +
        '<a href="javascript:void(0)" ng-click="nextPage()">' +
        '<i class="fa fa-chevron-right"></i></a>' +
        '</li>' +
        '</ul>';

      return template;
    }
  }
})();
