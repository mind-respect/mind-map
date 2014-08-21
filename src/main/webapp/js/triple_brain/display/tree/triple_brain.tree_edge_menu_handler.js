/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.identification_menu",
    "triple_brain.edge",
    "triple_brain.mind_map_info"
], function ($, IdentificationMenu, EdgeService, MindMapInfo) {
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {},
        forGroupNotOwned = {};
    api.forSingle = function(){
        return MindMapInfo.isViewOnly() ?
            forSingleNotOwned:
            forSingle;
    };
    forSingleNotOwned.identify = forSingle.identify = function (event, edge) {
        IdentificationMenu.ofGraphElement(
            edge
        ).create();
    };
    forSingleNotOwned.identifyCanDo = function(edge){
        return edge.hasIdentifications();
    };
    forSingle.remove = function (event, edge) {
        EdgeService.remove(edge,
            function (edge) {
                var vertex = edge.childVertexInDisplay();
                vertex.visitVerticesChildren(function (childVertex) {
                    childVertex.removeConnectedEdges();
                    childVertex.remove();
                });
                edge.remove();
                vertex.remove();
            }
        );
    };
    forSingle.reverseToRight = function (event, edge) {
        reverse(edge);
    };
    forSingle.reverseToLeft = function (event, edge) {
        reverse(edge);
    };
    forSingle.reverseToRightCanDo = function (edge) {
        var isToTheLeft = edge.isLeftOfCenterVertex();
        var isInverse = edge.isInverse();
        return  (isToTheLeft && !isInverse) ||
            (!isToTheLeft && isInverse);

    };
    forSingle.reverseToLeftCanDo = function (edge) {
        return !api.forSingle().reverseToRightCanDo(edge);
    };
    function reverse(edge) {
        EdgeService.inverse(
            edge,
            function () {
                edge.inverse();
            }
        );
    }
    api.forGroup = function(){
        return MindMapInfo.isViewOnly() ?
            forGroup:
            forGroupNotOwned;
    };
    return api;
});