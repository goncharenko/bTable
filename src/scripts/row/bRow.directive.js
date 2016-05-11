(function() {
  'use strict';
  
  var NG_REMOVED = '$$NG_REMOVED';

  angular
    .module('bTable')
    .directive('bRow', bRowDirective);

  bRowDirective.$inject = ['$animate', '$log'];
  function bRowDirective($animate, $log) {
    return {
      bindToController: true,
      compile: bRowCompile,
      multiElement: true,
      require: '^bTable',
      restrict: 'A',
      transclude: 'element',
      $$tlb: true,
    };

    function bRowCompile(el, attr, transclude) {
      $log.debug('bRowCompile activated!');
      return {
        post: bRowLink
      };
    }

    function bRowLink(scope, el, attr, ctrl, transclude) {
      $log.debug('bRowLink activated!');
      //https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js
      // Store a list of elements from previous run. This is a hash where key is the item from the
      // iterator, and the value is objects with following properties.
      // - scope: bound scope
      // - element: previous element.
      // - index: position
      // We are using no-proto object so that we don't need to guard against inherited props via
      // hasOwnProperty.
      var valueIdentifier = '$$rowData';
      var bRowEndComment = document.createComment(' end bRow ');

      var lastBlockMap = createMap();
      scope.$watchCollection(function watchModel(scope) {
        return ctrl.model.dataDsp;
      }, function handleModelChange(collection) {
        var index;
        var length;
        var previousNode = el[0]; // node that cloned nodes should be inserted after
        // initialized to the comment node anchor
        var nextNode;
        // Same as lastBlockMap but it has the current state. It will become the
        // lastBlockMap on the next iteration.
        var nextBlockMap = createMap();
        var collectionLength;
        var key;
        var value; // key/value of iteration
        var trackById;
        var trackByIdFn;
        var collectionKeys;
        var block; // last object information {scope, element, id}
        var nextBlockOrder;
        var elementsToRemove;

        trackByIdFn = bTrackByIdFn;

        collectionKeys = [];
        for (var itemKey in collection) {
          if (collection.hasOwnProperty(itemKey) && itemKey.charAt(0) !== '$') {
            collectionKeys.push(itemKey);
          }
        }

        collectionLength = collectionKeys.length;
        nextBlockOrder = new Array(collectionLength);

        // locate existing items
        for (index = 0; index < collectionLength; index++) {
          key = (collection === collectionKeys) ? index : collectionKeys[index];
          value = collection[key];
          trackById = trackByIdFn(key, value, index);
          if (lastBlockMap[trackById]) {
            // found previously seen block
            block = lastBlockMap[trackById];
            delete lastBlockMap[trackById];
            nextBlockMap[trackById] = block;
            nextBlockOrder[index] = block;
          } else if (nextBlockMap[trackById]) {
            // if collision detected restore lastBlockMap and throw an error
            angular.forEach(nextBlockOrder, function(block) {
              if (block && block.scope) {
                lastBlockMap[block.id] = block;
              }
            });
            throw new Error('Duplicate rows detected. The grid cannot render ' +
              'the same row twice. Use angular.copy to create a new instance.' +
              ' Duplicate value: ' + value);
          } else {
            // new never before seen block
            nextBlockOrder[index] = {
              id: trackById,
              scope: undefined,
              clone: undefined
            };
            nextBlockMap[trackById] = true;
          }
        }

        // remove leftover items
        for (var blockKey in lastBlockMap) {
          block = lastBlockMap[blockKey];
          elementsToRemove = getBlockNodes(block.clone);
          $animate.leave(elementsToRemove);
          if (elementsToRemove[0].parentNode) {
            // if the element was not removed yet because of pending animation, mark it as deleted
            // so that we can ignore it later
            length = elementsToRemove.length;
            for (index = 0; index < length; index++) {
              elementsToRemove[index][NG_REMOVED] = true;
            }
          }
          block.scope.$destroy();
        }

        // we are not using forEach for perf reasons (trying to avoid #call)
        for (index = 0; index < collectionLength; index++) {
          key = (collection === collectionKeys) ? index : collectionKeys[index];
          value = collection[key];
          block = nextBlockOrder[index];

          if (block.scope) {
            // if we have already seen this object, then we need to reuse the
            // associated scope/element

            nextNode = previousNode;

            // skip nodes that are already pending removal via leave animation
            do {
              nextNode = nextNode.nextSibling;
            } while (nextNode && nextNode[NG_REMOVED]);

            if (getBlockStart(block) !== nextNode) {
              // existing item which got moved
              $animate.move(getBlockNodes(block.clone), null,
                angular.element(previousNode));
            }
            previousNode = getBlockEnd(block);
            updateScope(block.scope, index, valueIdentifier,
              value, collectionLength);
          } else {
            /* jshint loopfunc:true */
            // new item which we don't know about
            transclude(function bRowTransclude(clone, scope) {
              block.scope = scope;
              // http://jsperf.com/clone-vs-createcomment
              var endNode = bRowEndComment.cloneNode(false);
              clone[clone.length++] = endNode;

              // TODO(perf): support naked previousNode in `enter` to avoid creation of jqLite wrapper?
              $animate.enter(clone, null, angular.element(previousNode));
              previousNode = endNode;
              // Note: We only need the first/last node of the cloned nodes.
              // However, we need to keep the reference to the jqlite wrapper as it might be changed later
              // by a directive with templateUrl when its template arrives.
              block.clone = clone;
              nextBlockMap[block.id] = block;
              updateScope(block.scope, index, valueIdentifier,
                value, collectionLength);
            });
            /* jshint loopfunc:false */
          }
        }
        lastBlockMap = nextBlockMap;
      });
    }

    function bTrackByIdFn(key) {
      return key;
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

    function createMap() {
      return Object.create(null);
    }

    function getBlockStart(block) {
      return block.clone[0];
    }

    function getBlockEnd(block) {
      return block.clone[block.clone.length - 1];
    }

    function updateScope(scope, index, valueIdentifier, value, arrayLength) {
      scope[valueIdentifier] = value;

      scope.$index = index;
      scope.$first = (index === 0);
      scope.$last = (index === (arrayLength - 1));
      scope.$middle = !(scope.$first || scope.$last);
      // jshint bitwise: false
      scope.$odd = !(scope.$even = (index & 1) === 0);
      // jshint bitwise: true

      scope.row = {
        data: scope.$$rowData,
        //view: gridController.getInitialView() || DEFAULT_VIEW,
        //viewModel: angular.copy(scope.$$rowData),
      };
    }
  }
})();
