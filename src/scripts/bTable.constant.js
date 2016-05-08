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
