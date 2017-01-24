/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_controller",
    "triple_brain.friendly_resource_service"
], function (MindMapInfo, GraphElementController, FriendlyResourceService) {
    "use strict";
    var api = {};
    api.PropertyController = PropertyControler;

    function PropertyControler(propertiesUi) {
        this.propertiesUi = propertiesUi;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.propertiesUi
        );
    }

    PropertyControler.prototype = new GraphElementController.GraphElementController();

    PropertyControler.prototype.removeCanDo = function () {
        return this.isSingleAndOwned();
    };

    PropertyControler.prototype.cutCanDo = function () {
        return false;
    };

    PropertyControler.prototype.remove = function () {
        var self = this;
        FriendlyResourceService.remove(this.propertiesUi, function () {
            self.propertiesUi.remove();
        });
    };

    PropertyControler.prototype.addSiblingCanDo = function () {
        return this.isSingleAndOwned();
    };

    PropertyControler.prototype.addSibling = function () {
        var schema = this.propertiesUi.getParentBubble();
        schema.getController().addChild(
            schema
        );
    };
    return api;
});