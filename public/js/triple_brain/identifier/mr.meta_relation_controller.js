/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_controller",
    "triple_brain.delete_menu",
    "triple_brain.graph_element_service"
], function (GraphElementController, DeleteMenu, GraphElementService) {
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
    MetaRelationController.prototype.remove = function () {
        var meta = this.getUi().getParentBubble().getModel();
        var graphElementToRemoveIdentifier = this.getModel().hasIdentification(meta) ?
            this.getUi() :
            this.getUi().getSourceVertex();
        graphElementToRemoveIdentifier.getController().removeIdentifier(
            meta
        ).then(function(){
            this.getUi().remove();
        }.bind(this));
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