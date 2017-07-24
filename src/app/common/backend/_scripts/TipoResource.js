(function () {

  'use strict';

  var deviceInformation = {};

  function getAllInterceptors(
    securityContextService,
    tipoErrorHandler,
    tipoCache,
    cognitoService,
    $http,
    $q,
    tipoRegistry) {

    function refreshAccesstoken() {
      var deferred = $q.defer();
      cognitoService.getUserSession().then(function(result) {
        console.log('GetSession', result);
        var securityContext = {
          'tokenDetails.id_token': result.getSignInUserSession().getIdToken().getJwtToken(),
          'tokenDetails.access_token': result.getSignInUserSession().getAccessToken().getJwtToken(),
          'loggedInUser': result.getUsername()
        };
        securityContextService.saveContext(securityContext);
        deferred.resolve();
      }, function(err) {
        console.log('GetSession error', err);
        // Refresh access-token logic
        securityContextService.relogin(deferred);
      });
      return deferred.promise;
    }

    return {
      request: {
        cache: function (element, operation, route, url, headers, params, httpConfig) {
          if (S(url).contains('TipoDefinition')) {
            httpConfig.cache = tipoCache.getPersistent();
          } else {
            if (!deviceInformation.isMobile) {
              httpConfig.cache = tipoCache.getMemory();
            }
          }
          return {
            element: element,
            headers: headers,
            params: params,
            httpConfig: httpConfig
          };
        },
        security: function (element, operation, route, url, headers, params, httpConfig) {
          var accessToken = securityContextService.getCurrentIdToken();
          if (!_.isUndefined(accessToken)) {
            headers = _.extend(headers, {
              'Authorization': accessToken
            });
          }

          return {
            element: element,
            headers: headers,
            params: params,
            httpConfig: httpConfig
          };
        }
      },
      response: {
        // Extracts the payload from the wrapped API response
        extractData: function (rawData) {
          if (rawData && rawData.response) {
            var resp = rawData.response;
            resp.tipo_name = rawData.tipo_name;
            resp.perm = rawData.perm;
            resp.tab_url = rawData.tab_url;
            resp.user_message = rawData.user_message;
            resp.return_url = rawData.return_url;
            resp.restricted_actions = rawData.restricted_actions;
            return rawData.response;
          } else if (rawData && rawData.data) {
            rawData.data.tab_url = rawData.tab_url;
            rawData.data.user_message = rawData.user_message;
            rawData.data.return_url = rawData.return_url;
            return rawData.data;
          } else {
            return rawData;
          }
        }
      },
      errors: {
        handleError: function (response, deferred, responseHandler) {
          console.log('error handling');
          console.error(response);

          if (response.status === 401) {
            refreshAccesstoken().then(function () {
              // Repeat the request and then call the handlers the usual way.
              response.config.headers.Authorization = securityContextService.getCurrentIdToken();
              $http(response.config).then(responseHandler, deferred.reject);
              // Be aware that no request interceptors are called this way.
            });
            return false;
          } else {
            tipoErrorHandler.handleError(response, deferred);
          }
          return true;
        }
      }
    };
  }

  // Configures Restangular for API interactions
  function configureRestangular(
    RestangularConfigurer,
    securityContextService,
    tipoErrorHandler,
    tipoCache,
    cognitoService,
    $http,
    $q,
    $window) {

    var interceptors = getAllInterceptors(securityContextService, tipoErrorHandler, tipoCache, cognitoService, $http, $q);
    var location = $window.location;
    var relativeUrl = location.pathname;
    if (_.startsWith(relativeUrl, '/app')) {
      // relativeUrl = '/api/d/tipotapp/constructionmanagement' + relativeUrl.substring(4);
      // relativeUrl = '/api/d/8501472954/sdm' + relativeUrl.substring(4);
      // relativeUrl = '/api/d/deltagene/billionbases' + relativeUrl.substring(4);
      relativeUrl = '/api' + relativeUrl.substring(4);
    } else {
      // relativeUrl = '/api/d/8501472954/sdm';
      // relativeUrl = '/api/d/tipotapp/constructionmanagement';
      // relativeUrl = '/api/d/deltagene/billionbases';
      relativeUrl = '/api';
    }
    var baseUrl = location.origin + relativeUrl;
    console.info('API Url - ' + baseUrl);
    RestangularConfigurer.setBaseUrl(baseUrl);
    RestangularConfigurer.setPlainByDefault(true);
    RestangularConfigurer.addFullRequestInterceptor(interceptors.request.cache);
    RestangularConfigurer.addFullRequestInterceptor(interceptors.request.security);
    RestangularConfigurer.addResponseInterceptor(interceptors.response.extractData);
    RestangularConfigurer.setErrorInterceptor(interceptors.errors.handleError);
    RestangularConfigurer.setDefaultHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Tipo Resource. This shall be used for invoking the Tipo REST APIs
  function TipoResource(
    Restangular,
    securityContextService,
    tipoErrorHandler,
    tipoCache,
    cognitoService,
    $mdMedia,
    $http,
    $q,
    $window) {
    deviceInformation = $.ua.device;
    var isSmallScreen = $mdMedia('xs');
    deviceInformation.isMobile = isSmallScreen || deviceInformation.type === 'mobile';
    var factory = Restangular.withConfig(_.partialRight(configureRestangular, securityContextService, tipoErrorHandler, tipoCache, cognitoService, $http, $q, $window));
    return factory;
  }

  // Tipo Resource. This shall be used for all the HTTP XHR calls

  function httpInterceptors(securityContextService){
    return{
      request: function(config){
        var accessToken = securityContextService.getCurrentIdToken();
        if (!_.isUndefined(accessToken)) {
          config.headers['Authorization'] = accessToken;
        }     
        return config;
      }
    }
  }

  angular.module('tipo.common')
    .factory('tipoResource', TipoResource);
    // .factory('httpInterceptors', httpInterceptors)
    // .config(function ($httpProvider) {
    //   // $httpProvider.interceptors.push('httpInterceptors');
    // });

})();