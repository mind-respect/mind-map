/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_controller"
], function (GraphElementController) {
    "use strict";
    var api = {};

    function MetaController(metas) {
        this.metas = metas;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.metas
        );
    }

    MetaController.prototype = new GraphElementController.GraphElementController();

    MetaController.prototype.identifyCanDo = function () {
        return false;
    };

    api.MetaController = MetaController;
    return api;
});