(function() {

  'use strict';

  function TipoViewRootController(
    tipoDefinition,
    tipo,
    tipoInstanceDataService,
    tipoManipulationService,
    tipoRouter,
    $state,
    $scope,
    $mdDialog,
    $mdToast,
    $stateParams) {

    var _instance = this;

    var perspective = $scope.perspective;

    _instance.tipoDefinition = tipoDefinition;
    console.log("_instance.tipoDefinition");
    console.log(_instance.tipoDefinition);
    _instance.tipo = tipo;

    var tipo_name = tipoDefinition.tipo_meta.tipo_name;
    var tipo_id = tipo.tipo_id;

    if ($stateParams.message) {
      var toast = $mdToast.tpToast();
      toast._options.locals = {
        header: 'Action successfully completed',
        body: $stateParams.message
      };
      $mdToast.show(toast);
    };

    _instance.edit = function(){
      tipoRouter.startStateChange();
      tipoRouter.toTipoEdit(tipo_name, tipo_id);
    };

    _instance.delete = function(){
      var confirmation = $mdDialog.confirm()
          .title('Delete Confirmation')
          .textContent('Are you sure that you want to delete this record?')
          .ariaLabel('Delete Confirmation')
          .ok('Yes')
          .cancel('No');
      $mdDialog.show(confirmation).then(function(){
        tipoRouter.startStateChange();
        // handle application perspective
        var filter = {};
        var perspectiveMetadata = tipoManipulationService.resolvePerspectiveMetadata();
        if(perspectiveMetadata.fieldName === 'application'){
          filter.tipo_filter = perspectiveMetadata.tipoFilter;
        }
        // ends here
        tipoInstanceDataService.deleteOne(tipo_name, tipo_id, filter).then(function(){
          if(tipoRouter.stickyExists()){
            tipoRouter.toStickyAndReset();
          }else{
            tipoRouter.toTipoList(tipo_name);
          }
        });
      });
    };

    _instance.toList = function(){
      tipoRouter.toTipoList(tipo_name);
    };

    _instance.toSubTipoList = function(subTipo){
      tipoRouter.to('subTipoListState', undefined, {sub_tipo_field_name: subTipo.field_name}, true);
    };

    function setCurrentActiveTab(name){
      if(_.isUndefined(name)){
        var currentStateName = tipoRouter.getCurrent().name;
        if(_.startsWith(currentStateName, 'subTipo')){
          name = $state.params.sub_tipo_field_name;
        }else{
          name = 'main';
        }
      }
      _instance.activeTab = name;
    }

    setCurrentActiveTab();

  }

  angular.module('tipo.framework')
  .controller('TipoViewRootController', TipoViewRootController);

})();