/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.ui.graph",
    "triple_brain.vertex_ui",
    "triple_brain.group_relation_ui"
], function ($, SelectionHandler, MindMapInfo, GraphUi, VertexUi, GroupRelationUi) {
    "use strict";
    var api = {};
    api.select = function () {
        SelectionHandler.handleButtonClick();
    };
    api.selectCanDo = function () {
        return !MindMapInfo.isSchemaMode();
    };
    api.expandAll = function () {
        var addChildTreeActions = [];
        VertexUi.visitAllVertices(function (vertexUi) {
            if (vertexUi.hasHiddenRelations()) {
                addChildTreeActions.push(
                    vertexUi.addChildTree()
                );
            }
        });
        $.when.apply($, addChildTreeActions).done(function(){
            GroupRelationUi.visitAllGroupRelations(function (groupRelationUi) {
                if(groupRelationUi.hasHiddenRelationsContainer()){
                    groupRelationUi.addChildTree();
                }
            });
            VertexUi.centralVertex().centerOnScreenWithAnimation();
        });
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
    return api;
});
 