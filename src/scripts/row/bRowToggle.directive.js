(function() {
  angular
    .module('bTable')
    .directive('bRowToggle', bRowToggleDirective);

  bRowToggleDirective.$inject = ['$log'];
  function bRowToggleDirective($log) {
    return {
      compile: bRowToggleCompile,
      restrict: 'AE',
      require: '^?bRow',
      template: getTemplate
    };

    function bRowToggleCompile(el, attr) {
      $log.debug('bRowToggleCompile activated!');
      return {
        post: bRowToggleLink
      };
    }

    var isToggle = false;

    function bRowToggleLink(scope, el, attr) {
      $log.debug('bRowToggleLink activated!');
      scope.toggle = toggle;

      function toggle() {
        if (scope.row.expanded) {
          scope.row.expanded = false;
        } else {
          scope.row.expanded = true;
        }
      }
    }

    function getTemplate(element, attrs) {
      var template = '';

      template +=
        '<a ng-click="toggle()">' +
        '<i class="fa" ng-class="{\'fa-angle-right\': !row.expanded, \'fa-angle-down\': row.expanded}"></i>' +
        '</a>';

      return template;
    }
  }
})();
