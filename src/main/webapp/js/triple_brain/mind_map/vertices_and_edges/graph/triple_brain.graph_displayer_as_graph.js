/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_html_builder",
    "triple_brain.ui.graph",
    "triple_brain.graph_displayer_as_graph_edge_creator",
    "triple_brain.user"
],
    function ($, IdUriUtils, VertexHtmlBuilder, GraphUi, EdgeCreatorForGraph, UserService) {
        var api = {};
        api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url: UserService.currentUserUri() + "/drawn_graph/" + depth + '/' + centralVertexEncodedUri,
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
        api.addEdge = function(edgeServer){
            return EdgeCreatorForGraph.fromServerFormat(
                edgeServer
            ).create();
        };
        api.addEdgeBetweenExistingVertices = function(edgeServer){
            var edge = api.addEdge(edgeServer);
            edge.focus();
        };
        api.allowsMovingVertices = function(){
            return true;
        };
        api.integrateEdges = function(edges){
            EdgeCreatorForGraph.arrayFromServerFormatArray(
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