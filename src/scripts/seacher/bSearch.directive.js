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

      template += '<span ng-transclude></span>';

      return template;
    }
  }
})();
