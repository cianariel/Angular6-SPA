(function() {

  'use strict';

  function registerStates($stateProvider) {
    var registerUserState = {
      name: 'registerUser',
      url: '/register',
      parent: 'layout',
      views: {
        'content@layout': {
          templateUrl: 'user/_views/registration.tpl.html',
          controller: 'UserController',
          controllerAs: 'userController'
        }
      }
    };

    var confirmRegistrationState = {
      name: 'confirmRegistration',
      url: '/confirmation/{confirmationCode}',
      parent: 'layout',
      views: {
        'content@layout': {
          templateUrl: 'user/_views/confirmation.tpl.html',
          controller: 'UserController',
          controllerAs: 'userController'
        }
      }
    };

    $stateProvider
      .state(registerUserState)
      .state(confirmRegistrationState);  
  }

  function configureModule($stateProvider) {
    registerStates($stateProvider);
  }

  var module = angular.module('tipo.user', [
  ]);

  module.config(function ($stateProvider) {
    configureModule($stateProvider);
  });

})();