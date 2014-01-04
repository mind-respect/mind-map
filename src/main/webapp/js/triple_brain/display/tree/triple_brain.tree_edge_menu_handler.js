/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.identification_menu",
    "triple_brain.edge",
    "triple_brain.tree_edge"
], function($, IdentificationMenu, EdgeService, TreeEdge){
    var api = {};
    api.forSingle = function(){
        var subApi = {};
        subApi.identify = function(event, edge){
            IdentificationMenu.ofGraphElement(
                edge
            ).create();
        };
        subApi.remove = function(event, edge){
            EdgeService.remove(edge,
                function (edge) {
                    var vertex = edge.childVertexInDisplay();
                    vertex.visitChildren(function (childVertex) {
                        childVertex.removeConnectedEdges();
                        childVertex.remove();
                    });
                    edge.remove();
                    vertex.remove();
                    TreeEdge.redrawAllEdges();
                }
            );
        };
        subApi.reverseToRight = function(event, edge){
            reverse(edge);
        };
        subApi.reverseToLeft = function(event, edge){
            reverse(edge);
        };
        subApi.reverseToRightCanDo = function(edge){
            var isToTheLeft = edge.isLeftOfCenterVertex();
            var isInverse = edge.isInverse();
            return  (isToTheLeft && !isInverse) ||
                    (!isToTheLeft && isInverse);

        };
        subApi.reverseToLeftCanDo = function(edge){
            return !subApi.reverseToRightCanDo(edge);
        };
        return subApi;
        function reverse(edge){
            EdgeService.inverse(
                edge,
                edge.inverse
            );
        }
    };
    api.forGroup  = function(){
        var subApi = {};
        return subApi;
    };
    return api;
});