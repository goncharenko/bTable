(function() {
  angular
    .module('bTable')
    .directive('bSearch', bSearchDirective);

  function bSearchDirective() {
    return {
      restrict: 'A',
      transclude: true,
      template: getTemplate,
      link: function(scope, element, attr, ctrl) {

      }
    };

    function getTemplate(element, attrs) {
      var template = '';

      //template += '<a ng-click="vm.onClick()">\
      //                <i class="fa fa-filter" ng-if="vm.showFilter()"></i>\
      //                <span ng-transclude></span>\
      //                <i class="fa" ng-class="{\'fa-chevron-up\' : vm.sortOrder === vm.sortBy && !vm.sortReverse,  \'fa-chevron-down\' : vm.sortOrder===vm.sortBy && vm.sortReverse}"></i>\
      //            </a>';
      template += '<span ng-transclude></span>';

      return template;
    }
  }
})();
