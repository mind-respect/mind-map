/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_menu_handler",
    "triple_brain.identification_menu",
    "triple_brain.edge_service",
    "triple_brain.mind_map_info",
    "triple_brain.identification",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_service",
    "triple_brain.group_relation_menu_handler"
], function ($, GraphElementMenuHandler, IdentificationMenu, EdgeService, MindMapInfo, Identification, GraphDisplayer, VertexService, GroupRelationMenuHandler) {
    "use strict";
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {},
        forGroupNotOwned = {};
    api.forSingle = function () {
        return MindMapInfo.isViewOnly() ?
            forSingleNotOwned :
            forSingle;
    };
    forSingleNotOwned.note = forSingle.note = function (event, edge) {
        forSingle.noteAction(edge);
    };

    forSingleNotOwned.noteAction = forSingle.noteAction = GraphElementMenuHandler.forSingle().noteAction;

    forSingleNotOwned.identify = forSingle.identify = function (event, edge) {
        forSingle.identifyAction(edge);
    };
    forSingle.addChild = function(event, edge){
        forSingle.addChildAction(edge);
    };
    forSingle.addChildAction = function(edge){
        var edgeAsAnIdentification = Identification.fromFriendlyResource(
            edge.getOriginalServerObject()
        );
        edgeAsAnIdentification.setLabel(
            edge.text()
        );
        edgeAsAnIdentification.setComment(
            edge.getNote()
        );
        var parentVertex = edge.getParentVertex();
        var newGroupRelation = GraphDisplayer.addNewGroupRelation(
            edgeAsAnIdentification,
            parentVertex
        );
        GroupRelationMenuHandler.forSingle().addChildAction(
            newGroupRelation
        );
        edge.moveToParent(newGroupRelation);
    };

    forSingle.identifyAction = function(edge){
        IdentificationMenu.ofGraphElement(
            edge
        ).create();
    };
    forSingleNotOwned.identifyCanDo = function (edge) {
        return edge.hasIdentifications();
    };
    forSingle.remove = function (event, edge) {
        forSingle.removeAction(edge);
    };
    forSingle.removeAction = function (edge) {
        EdgeService.remove(edge, function () {
            var childVertex = edge.getTopMostChildBubble();
            childVertex.remove();
        });
    };
    forSingle.reverseToRight = function (event, edge) {
        forSingle.reverse(edge);
    };
    forSingle.reverseToLeft = function (event, edge) {
        forSingle.reverse(edge);
    };
    forSingle.reverseToRightCanDo = function (edge) {
        var isToTheLeft = edge.isToTheLeft();
        var isInverse = edge.isInverse();
        return (isToTheLeft && !isInverse) ||
            (!isToTheLeft && isInverse);

    };
    forSingle.reverseToLeftCanDo = function (edge) {
        return !api.forSingle().reverseToRightCanDo(edge);
    };
    forSingle.reverse = function (edge) {
        EdgeService.inverse(
            edge,
            function () {
                edge.inverse();
            }
        );
    };
    api.forGroup = function () {
        return MindMapInfo.isViewOnly() ?
            forGroup :
            forGroupNotOwned;
    };
    return api;
});