(function() {

  'use strict';

  function TipoInstanceDataService(
    tipoResource,
    $q) {

    var _instance = this;

    function unwrapAndSort(collection){
      collection = _.filter(collection, function(each){
        return !_.isUndefined(each.data.tipo_id);
      });
      collection = _.map(collection, function(each){
        return each.data;
      });
      collection = _.sortBy(collection, function(each){
        return each.created_dt;
      });
      return collection;
    }

    function getCollectionResource(tipo_name){
      return tipoResource.all(tipo_name);
    }

    function getDocumentResource(tipo_name, id){
      return getCollectionResource(tipo_name).one(id);
    }

    _instance.search = function(tipo_name, criteria){
      criteria = criteria || {};
      criteria.short_display = 'Y';
      return getCollectionResource(tipo_name).getList(criteria).then(unwrapAndSort);
    };

    _instance.upsertAll = function(tipo_name, tipos){
      tipos = _.map(tipos, function(each){
        return {
          tipo_name: tipo_name,
          data: each
        };
      });
      return getCollectionResource(tipo_name).doPUT(tipos).then(unwrapAndSort);
    };

    _instance.getOne = function(tipo_name, id, criteria){
      return getDocumentResource(tipo_name, id).get(criteria);
    };

    _instance.updateOne = function(tipo_name, tipo, id){
      tipo = {
        tipo_name: tipo_name,
        data: tipo
      };
      if(_.isUndefined(tipo.tipo_id)){
        console.log('Tipo ID not defined, setting it');
        tipo.tipo_id = id;
      }
      return getDocumentResource(tipo_name, id).doPUT(tipo);
    };

    _instance.performSingleAction = function(tipo_name, tipo_id, action, additional_tipo_name, additional_tipo){
      var tipo = {};
      if(!_.isUndefined(additional_tipo_name)){
        tipo = {
          tipo_name: additional_tipo_name,
          data: additional_tipo
        };
      }
      return getDocumentResource(tipo_name, tipo_id).doPUT(tipo, undefined, {tipo_action: action});
    };

    _instance.performBulkAction = function(tipo_name, action, selected_tipo_ids, additional_tipo_name, additional_tipo){
      var tipos = _.map(selected_tipo_ids, function(each){
        return {
          tipo_name: tipo_name,
          data: {
            tipo_id: each
          }
        };
      });
      if(!_.isUndefined(additional_tipo_name)){
        tipos.push({
          tipo_name: additional_tipo_name,
          data: additional_tipo
        });
      }
      return getCollectionResource(tipo_name).doPUT(tipos, undefined, {tipo_action: action});
    };

    _instance.deleteOne = function(tipo_name, id){
      return getDocumentResource(tipo_name, id).remove();
    };

  }

  angular.module('tipo.framework')
    .service('tipoInstanceDataService', TipoInstanceDataService);

})();