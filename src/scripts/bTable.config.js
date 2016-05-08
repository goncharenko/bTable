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
