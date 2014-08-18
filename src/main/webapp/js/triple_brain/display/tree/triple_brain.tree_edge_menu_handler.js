/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.identification_menu",
    "triple_brain.edge"
], function ($, IdentificationMenu, EdgeService) {
    var api = {};
    api.forSingle = {};
    api.forSingle.identify = function (event, edge) {
        IdentificationMenu.ofGraphElement(
            edge
        ).create();
    };
    api.forSingle.remove = function (event, edge) {
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
    api.forSingle.reverseToRight = function (event, edge) {
        reverse(edge);
    };
    api.forSingle.reverseToLeft = function (event, edge) {
        reverse(edge);
    };
    api.forSingle.reverseToRightCanDo = function (edge) {
        var isToTheLeft = edge.isLeftOfCenterVertex();
        var isInverse = edge.isInverse();
        return  (isToTheLeft && !isInverse) ||
            (!isToTheLeft && isInverse);

    };
    api.forSingle.reverseToLeftCanDo = function (edge) {
        return !api.forSingle.reverseToRightCanDo(edge);
    };
    function reverse(edge) {
        EdgeService.inverse(
            edge,
            function () {
                edge.inverse();
            }
        );
    }
    api.forGroup = {};
    return api;
});