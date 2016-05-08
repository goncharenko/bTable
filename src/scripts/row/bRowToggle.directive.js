(function() {
  angular
    .module('bTable')
    .directive('bRowToggle', bRowToggleDirective);

  function bRowToggleDirective() {
    return {
      compile: bRowToggleCompile,
      restrict: 'AE',
      require: '^?bRow',
      template: getTemplate
    };

    function bRowToggleCompile(el, attr) {
      return {
        post: bRowToggleLink
      };
    }

    var isToggle = false;

    function bRowToggleLink(scope, el, attr) {
      console.log('bRowToggleLink activated');
      //scope.cssClass = 'fa-angle-right';
      scope.toggle = toggle;

      function toggle() {
        if (scope.row.expanded) {
          //isToggle = false;
          //scope.cssClass = 'fa-angle-right';
          scope.row.expanded = false;
        } else {
          //isToggle = true;
          //scope.cssClass = 'fa-angle-down';
          scope.row.expanded = true;
        }

        //if (scope.row && scope.row.data) {
        //  scope.row.expanded = isToggle;
        //}
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
