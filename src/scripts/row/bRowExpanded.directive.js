(function() {
  'use strict';
  
  angular
    .module('bTable')
    .directive('bRowExpanded', bRowExpandedDirective);

  bRowExpandedDirective.$inject = ['$animate', '$log'];
  function bRowExpandedDirective($animate, $log) {
    return {
      compile: bRowExpandedCompile,
      restrict: 'AE',
      require: '^?bRow',
      transclude: 'element',
    };

    function bRowExpandedCompile(el, attr, transclude) {
      $log.debug('bRowExpandedCompile activated!');
      return {
        post: bRowExpandedLink
      };
    }

    function bRowExpandedLink(scope, el, attr, ctrl, transclude) {
      $log.debug('bRowExpandedLink activated!');
      // https://github.com/angular/angular.js/blob/master/src/ng/directive/ngIf.js
      var block;
      var childScope;
      var previousElements;
      scope.$watch(function() {
        return scope.row.expanded;
      }, function bRowExpandedWatchAction(value) {
        if (value) {
          if (!childScope) {
            transclude(function(clone, newScope) {
              childScope = newScope;
              clone[clone.length++] = document.createComment(' end bRowExpanded ');
              // Note: We only need the first/last node of the cloned nodes.
              // However, we need to keep the reference to the jqlite wrapper as it might be changed later
              // by a directive with templateUrl when its template arrives.
              block = {
                clone: clone
              };
              $animate.enter(clone, el.parent(), el);
            });
          }
        } else {
          if (previousElements) {
            previousElements.remove();
            previousElements = null;
          }
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }
          if (block) {
            previousElements = getBlockNodes(block.clone);
            $animate.leave(previousElements)
              .then(function() {
                previousElements = null;
              });
            block = null;
          }
        }
      });
    }

    function getBlockNodes(nodes) {
      var node = nodes[0];
      var endNode = nodes[nodes.length - 1];
      var blockNodes = [node];

      do {
        node = node.nextSibling;
        if (!node) {
          break;
        }
        blockNodes.push(node);
      } while (node !== endNode);

      return angular.element(blockNodes);
    }
  }
})();
