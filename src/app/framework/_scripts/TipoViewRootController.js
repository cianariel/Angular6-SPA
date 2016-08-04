(function() {

  'use strict';

  function TipoViewRootController(
    tipoDefinition,
    tipo,
    tipoRouter) {
    
    var _instance = this;
    _instance.tipoDefinition = tipoDefinition;
    _instance.tipo = tipo;

    _instance.edit = function(){
      var tipo_name = _instance.tipoDefinition.tipo_meta.tipo_name;
      var tipo_id = _instance.tipo.TipoID;
      tipoRouter.toTipoEdit(tipo_name, tipo_id);
    };

  }

  angular.module('tipo.framework')
  .controller('TipoViewRootController', TipoViewRootController);

})();