(function() {

  'use strict';

  function TipoEditRootController(
    tipoDefinition,
    tipo,
    tipoManipulationService,
    tipoInstanceDataService,
    tipoRouter,
    $scope,
    $mdToast,
    $stateParams) {
    
    var _instance = this;
    _instance.tipoDefinition = tipoDefinition;
    _instance.tipoDefinition.tipo_field_groups = tipo.tipo_field_groups;
    _instance.tipo = tipo;

    var tipo_name = tipoDefinition.tipo_meta.tipo_name;
    var tipo_id = tipo.tipo_id;

    var perspective = $scope.perspective;

    if ($stateParams.message) {
      var toast = $mdToast.tpToast();
      toast._options.locals = {
        header: 'Action successfully completed',
        body: $stateParams.message
      };
      $mdToast.show(toast);
    };

    _instance.save = function(){
      tipoRouter.startStateChange();
      var data = {};
      tipoManipulationService.extractDataFromMergedDefinition(_instance.tipoDefinition, data);
      data.copy_from_tipo_id = tipo.copy_from_tipo_id;
      tipoInstanceDataService.updateOne(tipo_name, data, tipo_id).then(function(result){
        if(tipoRouter.stickyExists()){
          tipoRouter.toStickyAndReset();
        }else{
          tipoRouter.toTipoView(tipo_name, tipo_id);
        }
      });
    };

    _instance.toList = function(){
      tipoRouter.toTipoList(tipo_name);
    };

    _instance.toView = function(){
      tipoRouter.toTipoView(tipo_name, tipo_id);
    };

    _instance.cancel = function(){
      _instance.toView();
    };


  }

  angular.module('tipo.framework')
  .controller('TipoEditRootController', TipoEditRootController);

})();