/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_controller",
    "mr.meta_relation_delete_menu"
], function (GraphElementController, MetaRelationDeleteMenu) {
    "use strict";
    var api = {};

    function MetaRelationController(relations) {
        this.relations = relations;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.relations
        );
    }

    MetaRelationController.prototype = new GraphElementController.GraphElementController();
    MetaRelationController.prototype.centerCanDo = function () {
        return false;
    };
    MetaRelationController.prototype.noteCanDo = function () {
        return false;
    };
    MetaRelationController.prototype.removeCanDo = function () {
        return this.isOwned();
    };
    MetaRelationController.prototype.remove = function (skipConfirmation) {
        if(skipConfirmation){
            return doIt.bind(this)();
        }else{
            return MetaRelationDeleteMenu.ofMetaRelation(
                this.getUi()
            ).ask().then(doIt.bind(this));
        }
        function doIt(){
            var meta = this.getUi().getParentBubble().getModel();
            var graphElementToRemoveIdentifier = this.getModel().hasIdentification(meta) ?
                this.getUi() :
                this.getUi().getSourceVertex();
            graphElementToRemoveIdentifier.getController().removeIdentifier(
                meta
            ).then(function(){
                this.getUi().remove();
            }.bind(this));
        }
    };
    MetaRelationController.prototype.cutCanDo = function () {
        return false;
    };
    MetaRelationController.prototype.identifyCanDo = function () {
        return false;
    };
    api.MetaRelationController = MetaRelationController;
    return api;
});