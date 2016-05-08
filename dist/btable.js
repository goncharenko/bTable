(function() {
  'use strict';

  angular.module('bTable', []);
})();

(function() {
  'use strict';

  angular.module('bTable')
     .config(configure);

  configure.$inject = [
        '$logProvider'];

  function configure($logProvider) {

    configureLogging();
    //configureExceptions();

    function configureLogging() {
      // turn debugging off/on (no info or warn)
      if ($logProvider.debugEnabled) {
        $logProvider.debugEnabled(false);
      }
    }

    // function configureExceptions() {
    //   exceptionConfigProvider.config.appErrorPrefix = config.appErrorPrefix;
    // }
  }
})();

(function() {
  'use strict';

  angular.module('bTable')
     .constant('config', config);

  var events = {
    controllerActivateSuccess: 'controller.activateSuccess',
  };

  var keyCodes = {
    backspace: 8,
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    insert: 45,
    del: 46
  };

  var config = {
    appErrorPrefix: '[bTable Error]',
    events: events,
    keyCodes: keyCodes,
    version: '0.0.1'
  };
})();

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

(function() {

  angular
    .module('bTable')
    .directive('bPaginator', bPaginatorDirective);

  bPaginatorDirective.$inject = ['$q'];

  function bPaginatorDirective($q) {
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
      return {
        pre: bPaginatorPreLink,
        post: bPaginatorPostLink
      };
    }

    function bPaginatorPreLink(scope, el, attr, ctrl) {
      console.log('bPaginatorLink activated');
      el.addClass('pagination');
    }

    function bPaginatorPostLink(scope, el, attr, ctrl) {
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
        //bindData();
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
        //scope.currentPage = n;
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

(function() {
  var NG_REMOVED = '$$NG_REMOVED';

  angular
    .module('bTable')
    .directive('bRow', bRowDirective);

  bRowDirective.$inject = ['$animate'];

  function bRowDirective($animate) {
    console.log('bRowDirective activated');

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
      return {
        post: bRowLink
      };
    }

    function bRowLink(scope, el, attr, ctrl, transclude) {
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

(function() {
  angular
    .module('bTable')
    .directive('bRowExpanded', bRowExpandedDirective);

  bRowExpandedDirective.$inject = ['$animate'];

  function bRowExpandedDirective($animate) {
    return {
      compile: bRowExpandedCompile,
      restrict: 'AE',
      require: '^?bRow',
      transclude: 'element',
    };

    function bRowExpandedCompile(el, attr, transclude) {
      return {
        post: bRowExpandedLink
      };
    }

    function bRowExpandedLink(scope, el, attr, ctrl, transclude) {
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

(function() {

  angular
    .module('bTable')
    .controller('bTableController', bTableController);

  bTableController.$inject = ['$scope', '$q', 'limitToFilter'];

  function bTableController($scope, $q, limitToFilter) {
    var vm = this;

    activate();

    function activate() {
      console.log('bTableController activated');

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

(function() {
  angular
     .module('bTable')
     .directive('bTable', bTableDirective);

  function bTableDirective() {
    return {
      bindToController: true,
      controller: 'bTableController',
      controllerAs: 'vm',
      link: bTableLink,
      restrict: 'A',
      scope: {
        model: '='
      }
    };

    function bTableLink(scope, el, attr, ctrl) {
      console.log('bTableLink activated');
      //el.addClass('b-table');
      el.addClass('table');
      el.addClass('table-striped');
    }
  }
})();

(function() {

  angular
    .module('bTable')
    .directive('bSort', bSortDirective);

  bSortDirective.$inject = ['$q', 'orderByFilter'];

  function bSortDirective($q, orderByFilter) {
    console.log('bSortDirective activated');
    return {
      compile: bSortCompile,
      require: '^bTable',
      restrict: 'A',
      scope: true,
      template: getTemplate,
      transclude: true,
    };

    function bSortCompile(el, attr, transclude) {
      return {
        post: bSortLink
      };
    }

    function bSortLink(scope, el, attr, ctrl, transclude) {
      console.log('bRowLink activated');
      var predicate = attr.bSort;
      var sorter = ctrl.model.sorter;
      scope.sort = sort;

      scope.$watch(function() {
        return ctrl.model.sorter;
      }, function(sorter) {
        //if (sorter && sorter.isSort) {
        updateCss(scope, predicate, sorter);
        //}
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
            // if (model.pager) {
            //   model.pager.currentPage = 0;
            // }
          });
        } else {
          model.data = orderByFilter(model.data,
              sorter.predicate, sorter.reverse);
          sorter.isSort = true;
          // if (model.pager) {
          //   model.pager.currentPage = 0;
          // }
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
