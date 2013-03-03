/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.config",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_html_builder",
    "triple_brain.ui.graph"
],
    function ($, Config, MindMapInfo, IdUriUtils, VertexHtmlBuilder, GraphUi) {
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
        return api;
        function addVerticesToHtml(vertices) {
            $.each(vertices, api.addVertex);
        }
    }
);