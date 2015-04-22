/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.identification_menu",
    "triple_brain.edge_service",
    "triple_brain.mind_map_info"
], function ($, IdentificationMenu, EdgeService, MindMapInfo) {
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
    forSingleNotOwned.identify = forSingle.identify = function (event, edge) {
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