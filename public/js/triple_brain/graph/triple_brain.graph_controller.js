/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.graph_ui",
    "triple_brain.vertex_ui",
    "triple_brain.graph_element_ui",
    "triple_brain.group_relation_ui",
    "triple_brain.compare_flow"
], function ($, SelectionHandler, MindMapInfo, GraphUi, VertexUi, GraphElementUi, GroupRelationUi, CompareFlow) {
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
        $.when.apply($, addChildTreeActions).done(function () {
            GroupRelationUi.visitAllGroupRelations(function (groupRelationUi) {
                if (groupRelationUi.hasHiddenRelationsContainer()) {
                    groupRelationUi.addChildTree();
                }
            });
            GraphElementUi.getCenterBubble().centerOnScreenWithAnimation();
        });
    };
    api.compare = function () {
        CompareFlow.enter();
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
    api.getElements = function () {
        return [];
    };
    return api;
});
 