(function() {
  'use strict';

  angular
    .module('bTable')
    .config(configure);

  configure.$inject = ['$logProvider'];
  function configure($logProvider) {

    configureLogging();

    function configureLogging() {
      // turn debugging off/on (no info or warn)
      if ($logProvider.debugEnabled) {
        $logProvider.debugEnabled(false);
      }
    }
  }
})();
