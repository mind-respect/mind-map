/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.vertex_controller"
], function (VertexController) {
    "use strict";
    var api = {};

    function GroupVertexUnderMetaController(vertices) {
        this.vertices = vertices;
        VertexController.VertexController.prototype.init.call(
            this,
            this.vertices
        );
    }

    GroupVertexUnderMetaController.prototype = new VertexController.VertexController();
    api.GroupVertexUnderMetaController = GroupVertexUnderMetaController;
    return api;
});