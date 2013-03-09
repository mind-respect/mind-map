/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.config",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_html_builder",
    "triple_brain.ui.graph",
    "triple_brain.ui.edge_creator"
],
    function ($, Config, MindMapInfo, IdUriUtils, VertexHtmlBuilder, GraphUi, EdgeCreator) {
        var api = {};
        api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url:Config.links.app + '/service/drawn_graph/' + MindMapInfo.uri() + "/" + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(function (drawnGraph) {
                    addVerticesToHtml(drawnGraph.vertices);
                    callback(drawnGraph);
                });
        };
        api.addVertex = function(newVertex){
            var newVertexHtmlFacade = VertexHtmlBuilder.withJsonHavingAbsolutePosition(
                newVertex
            ).create();
            GraphUi.addHTML(
                newVertexHtmlFacade.getHtml()
            );
            return newVertexHtmlFacade;
        };
        api.allowsMovingVertices = function(){
            return true;
        };
        api.integrateEdges = function(edges){
            EdgeCreator.arrayFromServerFormatArray(
                edges
            );
        };
        return api;
        function addVerticesToHtml(vertices) {
            $.each(vertices, function(uri, vertex){
                var vertexHtmlFacade = VertexHtmlBuilder.withJsonHavingRelativePosition(
                    vertex
                ).create();
                GraphUi.addHTML(
                    vertexHtmlFacade.getHtml()
                );
            });
        }
    }
);