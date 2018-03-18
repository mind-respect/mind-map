/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.command",
    "triple_brain.graph_ui",
    "triple_brain.vertex_service",
    "triple_brain.mind_map_info",
    "triple_brain.graph_displayer",
    "triple_brain.vertex",
    "triple_brain.id_uri"
], function ($, Command, GraphUi, VertexService, MindMapInfo, GraphDisplayer, Vertex, IdUri) {
    "use strict";
    var api = {};
    api.undoCanDo = function () {
        return Command.canUndo();
    };
    api.undo = function () {
        Command.undo();
    };
    api.redo = function () {
        Command.redo();
    };
    api.redoCanDo = function () {
        return Command.canRedo();
    };
    api.getUi = function () {
        return [];
    };
    api.find = function () {
        $("#vertex-search-input").focus();
    };
    api.zoomIn = function () {
        GraphUi.zoom(
            0.1
        );
    };
    api.zoomOut = function () {
        GraphUi.zoom(
            -0.1
        );
    };

    api.createVertex = function () {
        VertexService.createVertex(function (newVertex) {
            var serverFormatFacade = Vertex.fromServerFormat(
                newVertex
            );
            if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                window.location = IdUri.htmlUrlForBubbleUri(serverFormatFacade.getUri());
                return;
            }
            GraphDisplayer.displayUsingCentralBubbleUri(
                serverFormatFacade.getUri()
            );
        });
    };
    api.changeBackgroundColorCanDo = function () {
        return !MindMapInfo.isViewOnly();
    };

    api.changeBackgroundColor = function () {
        $("#background-color-picker").click();
    };

    api.isMultiple = function () {
        return false;
    };

    $("#background-color-picker").on("change", function () {
            GraphUi.changeBackgroundColor(this.value);
            VertexService.saveColors({background: this.value});
        }
    );

    return api;
});
