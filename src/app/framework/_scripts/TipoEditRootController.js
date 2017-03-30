(function() {

  'use strict';

  function TipoObjectDialogController(
    tipoDefinition,
    tipoManipulationService,
    $scope,
    $mdDialog) {

    var _instance = this;
    var label_field = $scope.label_field;
    _instance.tiposWithDefinition = tipoDefinition.tiposWithDefinition;
    _instance.tipoDefinition = tipoDefinition.tipoDefinition;
    _instance.tipos = tipoDefinition.tipos;
    _instance.popup = true;
    _instance.tipo_fields = $scope.tipo_fields;
    _instance.selectedTipos = $scope.selectedTipos;
    $scope.fullscreen = true;
    if (!_.isUndefined($scope.selectedTipos) && !_.isEmpty($scope.selectedTipos)) {
      _.each(_instance.tipos, function(tipo){
          if (!_.isUndefined(tipo.tipo_id)){
            tipo.key = tipo.tipo_id;
            tipo.label = tipo[label_field];
          };
          _.each($scope.selectedTipos,function(selected){
            if (!_.isUndefined(selected)) {
              if(tipo.key === selected.key){
                tipo.selected = true;
              }
            };
          })
        });
    }else{
      $scope.selectedTipos = [];
    }
    _instance.maximize = function(){
      $scope.fullscreen = true;
    };

    _instance.restore = function(){
      $scope.fullscreen = false;
    };

    _instance.selectTipo = function(tipoSelected,event,tiposData){
      if (!$scope.isArray) {
        $scope.selectedTipos = [];
        _.each(tiposData, function(tipo){
          tipo.selected = false;
        });
      }
      tipoSelected.selected = !tipoSelected.selected;
      if(tipoSelected.selected){
        $scope.selectedTipos.push(tipoSelected);
      }else{
        _.remove($scope.selectedTipos,function(tipo){
          return (tipo.key === tipoSelected.key);
        });
      }
      event.stopPropagation();
    }
    _instance.finish = function() {    
      $mdDialog.hide($scope.selectedTipos);
    };
    _instance.cancel = function() {
      $mdDialog.cancel();
    };
  }

  function TipoEditRootController(
    tipoDefinition,
    tipo,
    tipoManipulationService,
    tipoInstanceDataService,
    tipoRouter,
    $scope,
    $mdToast,
    $stateParams,
    $mdDialog) {
    
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
      tipoManipulationService.modifyTipoData(_instance.tipo);
      data.copy_from_tipo_id = tipo.copy_from_tipo_id;
      tipoInstanceDataService.updateOne(tipo_name, _instance.tipo, tipo_id).then(function(result){
        if(tipoRouter.stickyExists()){
          tipoRouter.toStickyAndReset();
        }else{
          tipoRouter.toTipoView(tipo_name, tipo_id);
        }
      });
    };

     _instance.setInstance = function(uniq_name,data){
      if (_.isUndefined(_instance[uniq_name])) {
        _instance[uniq_name] = {};
      };
      if (!_.isUndefined(data)) {
        _instance[uniq_name].options = data.options;
        _instance[uniq_name].tipos = data.tipos;
      };
      var tipo_data = _instance.tipo[uniq_name];
      if (!_.isUndefined(tipo_data)) {
        if (_.isArray(tipo_data)) {
          _instance[uniq_name].model = _.map(tipo_data, function(each){
            return {
              key: each,
              label: _instance.tipo[uniq_name + '_refs']['ref' + each]
            };
          });
        }else{
          _instance[uniq_name].model = {key: tipo_data, label: _instance.tipo[uniq_name + '_refs']['ref' + tipo_data] }
        }
      };
    }

    _instance.loadOptions = function (baseFilter,tipo_name,label_field,uniq_name){
      _instance[uniq_name] = {};
      tipoInstanceDataService.gettpObjectOptions(baseFilter,tipo_name,label_field,_instance.tipoDefinition).then(function(result){
        _instance.setInstance(uniq_name,result)
      });      
    };

    _instance.initCollapsed = function(uniq_name,collapsed){
      if (!_.isNil(collapsed)) {
        _instance[uniq_name] = {collapsed: collapsed};
      }else{
        _instance[uniq_name] = {collapsed: false};
      }
    }

    _instance.setLabel = function(prefix,label,index){
      _instance[prefix + index + label] = {};
      var tipo_data = _.get(_instance.tipo[prefix][index],label);
      if (_.startsWith(tipo_data,'Tipo') || _.startsWith(tipo_data,'FieldGroup')) {
        _instance[prefix + index + label].model={key: tipo_data , label: _.get(_instance.tipo[prefix][index],label + '_refs.ref' + tipo_data )}
      }else{
        _instance[prefix + index + label].model={key: tipo_data , label: _.get(_instance.tipo[prefix][index],label + '_refs.ref' + tipo_data )}
      }
    }

    _instance.loadPopupOptions = function (baseFilter,tipo_name,label_field,uniq_name){
      return tipoInstanceDataService.gettpObjectOptions(baseFilter,tipo_name,label_field,_instance.tipoDefinition).then(function(result){
        _instance.setInstance(uniq_name,result)
      });      
    };

    _instance.renderSelection = function(tipo_name){
      var text = '<div class="placeholder"></div>';
        if (_instance[tipo_name].model && _instance[tipo_name].model.length){
          text = '<div class="multiple-list">';
          _.each(_instance[tipo_name].model, function(each){
            text += '<div>' +each.label + '</div>';
          });
          text += '</div>';
        }
          return text;
    };

    _instance.searchTerm = {};
    _instance.cleanup = function(uniq_name,prefix,label,index){
      var tipo_data = _instance[uniq_name].model;
      if (_.isUndefined(prefix)) {
        if (_.isArray(tipo_data)){
          _instance.tipo[uniq_name]=[];
          _.each(tipo_data,function(each){
            _instance.tipo[uniq_name].push(each.key);
            _.set(_instance.tipo, uniq_name + '_refs.ref' + each.key, each.label);
          });
        }else{
          _instance.tipo[uniq_name] = tipo_data.key;
          _.set(_instance.tipo, uniq_name + '_refs.ref' + tipo_data.key, tipo_data.label);
        }
      }else{
        if (_.isArray(tipo_data)){
          _instance.tipo[prefix][index][label]=[];
          _.each(tipo_data,function(each){
            _instance.tipo[prefix][index][label].push(each.key);
            _.set(_instance.tipo[prefix][index], label + '_refs.ref' + each.key, each.label);
          });
        }else{
          _instance.tipo[prefix][index][label] = tipo_data.key;
          _.set(_instance.tipo[prefix][index], label + '_refs.ref' + tipo_data.key, tipo_data.label);
        }
      }
      delete _instance.searchTerm.text;
    }

    function extractDatafromDefinition(field_name,index){
      var definition = _.find(_instance.tipoDefinition.tipo_fields,{field_name: field_name})
      return definition;
    }

    function updateDatafromDefinition(definition,index,field_name){
      _.each(definition.tipo_fields,function(field){
        if (_.isUndefined(index)) {
         _.set(_instance.tipo,field.fq_field_name,field._value.key);
        }else{
          _.set(_instance.tipo[field_name][index],field.field_name,field._value.key);
        }
      });
    }

    function generateGroupItem(field_name,definition){
      var newObject = {};
      _.each(definition.tipo_fields,function(field){
        newObject[field.field_name] = null;
      });
      if (_.isUndefined(_instance.tipo[field_name])) {
        _instance.tipo[field_name] = [];
      };
      _instance.tipo[field_name].push(newObject);
    }


    function openTipoObjectDialog(baseFilter,tipo_name,label_field,uniq_name,isArray,prefix,label,index){
      var promise1 =  _instance.loadPopupOptions(baseFilter,tipo_name,label_field,uniq_name);
      promise1.then(function(){
      var newScope =$scope.$new();
      var tipo_data = _instance[uniq_name].model;
      newScope.label_field = label_field;
      newScope.selectedTipos = [];
      if (isArray) {
        newScope.isArray = true;
        newScope.selectedTipos = tipo_data;
      }else{
        newScope.isArray = false;
        newScope.selectedTipos.push(tipo_data);
      }
      newScope.field = _instance.tipoDefinition;
      newScope.tipo_fields = _instance.tipoDefinition.tipo_fields;
      var promise = $mdDialog.show({
        templateUrl: 'framework/_directives/_views/tp-lookup-popup-select.tpl.html',
        controller: TipoObjectDialogController,
        controllerAs: 'tipoRootController',
        scope: newScope,
        resolve: /*@ngInject*/
        {
          tipoDefinition: function(tipoDefinitionDataService, tipoManipulationService) {
            return tipoDefinitionDataService.getOne(tipo_name).then(function(definition){
              var tiposWithDefinition = tipoManipulationService.mergeDefinitionAndDataArray(definition, _instance[uniq_name].tipos, label_field);
              return {tipoDefinition: definition, tiposWithDefinition: tiposWithDefinition,tipos: _instance[uniq_name].tipos }
            });
          }
        },
        skipHide: true,
        clickOutsideToClose: true,
        fullscreen: true
      });
      promise.then(function(selectedObjects){
          if (isArray) {
            _instance[uniq_name].model = _.map(selectedObjects, function(each){
              return {
                key: each.key,
                label: each.label
              };
            });
          }else{
            _instance[uniq_name].model = {key: selectedObjects[0].key, label: selectedObjects[0].label};
          } 
            _instance.cleanup(uniq_name,prefix,label,index);
      });
      });

    }

    _instance.tipoObjecSelectiontDialog = function(baseFilter,tipo_name,label_field,uniq_name,isArray,prefix,label,index){
      var promise = openTipoObjectDialog(baseFilter,tipo_name,label_field,uniq_name,isArray,prefix,label,index);
    }

    _instance.Date = function(date){
      return new Date(date);
    }

    _instance.toList = function(){
      tipoRouter.toTipoList(tipo_name);
    };

    _instance.toView = function(){
      tipoRouter.toTipoView(tipo_name, tipo_id);
    };

    _instance.cancel = function(){
      _instance.toView();
    };

    _instance.showDetail = function(field_name,index){
      var definition = extractDatafromDefinition(field_name);
      if (!_.isUndefined(index)) {
        definition = definition._items[index];
      };
      var newScope = $scope.$new();
      newScope.definition = definition;
      newScope.mode = "edit";
      var promise = $mdDialog.show({
        templateUrl: 'framework/_directives/_views/tp-view-dialog.tpl.html',
        controller: 'TipoGroupDialogController',
        scope: newScope,
        skipHide: true,
        clickOutsideToClose: true,
        fullscreen: true
      });
      promise.then(function(){
        updateDatafromDefinition(definition,index,field_name);
      });
    }
    _instance.lookupTipo = function(field_name){
      var definition = extractDatafromDefinition(field_name);
      var newScope = $scope.$new();
      newScope.root = $scope.root;
      newScope.context = $scope.context;
      newScope.definition = $scope.group;
      newScope.target = definition;
      $mdDialog.show({
        templateUrl: 'framework/_directives/_views/tp-lookup-dialog.tpl.html',
        controller: 'TipoLookupDialogController',
        scope: newScope,
        skipHide: true,
        clickOutsideToClose: true,
        fullscreen: true
      });
    }

    _instance.generateItem = function(field_name){
      var definition = extractDatafromDefinition(field_name);
      tipoManipulationService.generateGroupItem(definition);
      generateGroupItem(field_name,definition);
    }

    _instance.deleteItem = function(field_name,index){
      var group = extractDatafromDefinition(field_name);
      var groupItem = group._items[index];
      if(_.isUndefined(groupItem._ui.hash)){
        // indicates that this item was never saved on the backend, hence just delete it
        _.remove(group._items, function(each){
          return each === groupItem;
        });
      }else{
        // indicates that this item already exists in the backend, hence flagging it for deletion
        groupItem._ui.deleted = true;
      }
      if (_.isUndefined(_instance.tipo[field_name][index]._ARRAY_META)) {
        _.remove(_instance.tipo[field_name], function(each){
          return each === _instance.tipo[field_name][index];
        });
      }else{
        _instance.tipo[field_name][index]._ARRAY_META._STATUS = 'DELETED';
      }
    }

    _instance.cloneItem = function(field_name,index){
      var group = extractDatafromDefinition(field_name);
      var groupItem = group._items[index];
      var clonedItem = angular.copy(groupItem);
      delete clonedItem._ARRAY_META;
      delete clonedItem._ui.hash;
      group._items.push(clonedItem);
      var cloneObj = angular.copy(_instance.tipo[field_name][index]);
      cloneObj._ARRAY_META = {};
      _instance.tipo[field_name].push(cloneObj);
    }

    _instance.filterByDeleted = function(obj){
      var val = false;
      if ( _.isUndefined(obj._ARRAY_META)) {
        val = true;
      }else{
        if (obj._ARRAY_META._STATUS !== "DELETED") {
          val = true;
        }
      };
      return val;
    }



  }

  angular.module('tipo.framework')
  .controller('TipoEditRootController', TipoEditRootController);

})();