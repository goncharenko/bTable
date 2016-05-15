(function() {
  'use strict';

  var config = {
    appErrorPrefix: '[bTable Error]',
    version: '0.0.3'
  };

  angular
    .module('bTable')
    .constant('config', config);
})();
