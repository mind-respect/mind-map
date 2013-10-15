/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.id_uri",
    "triple_brain.vertex_html_builder_for_graph_displayer",
    "triple_brain.ui.graph",
    "triple_brain.graph_vertex",
    "triple_brain.straight_arrow_edge_drawer",
    "triple_brain.edge_html_builder_for_graph_displayer",
    "triple_brain.graph_edge",
    "triple_brain.graph_vertex"
],
    function ($, GraphService, IdUriUtils, VertexHtmlBuilder, GraphUi, GraphVertex, StraightArrowEdgeDrawer, EdgeHtmlBuilder, GraphEdge, GraphVertex) {
        var api = {};
        api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
            getDrawnGraphFromServer(
                centralVertexUri,
                depth,
                function (drawnGraph) {
                    addVerticesToHtml(drawnGraph.vertices);
                    callback(drawnGraph);
                }
            );
        };
        api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
            var depth = 1;
            getDrawnGraphFromServer(
                destinationVertexUri,
                depth,
                function (drawnGraph) {
                    $.each(drawnGraph.vertices, function (uri, vertex) {
                        if (vertexWithUriExists(uri)) {
                            return;
                        }
                        addVertexServerFormatHavingRelativePosition(
                            vertex
                        );
                    });
                    var centerVertex = GraphVertex.withUri(destinationVertexUri)[0];
                    callback(drawnGraph, centerVertex);
                }
            );
            function vertexWithUriExists(uri){
                return GraphVertex.withUri(uri).length > 0;
            }
        };
        api.name = function () {
            return "graph";
        };
        api.addVertex = function (newVertex) {
            var newVertexHtmlFacade = VertexHtmlBuilder.withJsonHavingAbsolutePosition(
                newVertex
            ).create();
            GraphUi.addHtml(
                newVertexHtmlFacade.getHtml()
            );
            return newVertexHtmlFacade;
        };
        api.addEdge = function (edgeServer) {
            return EdgeHtmlBuilder.fromServerFormat(
                edgeServer
            ).create();
        };
        api.addEdgeBetweenExistingVertices = function (edgeServer) {
            var edge = api.addEdge(edgeServer);
            edge.focus();
        };
        api.allowsMovingVertices = function () {
            return true;
        };
        api.integrateEdgesOfServerGraph = function (drawnGraph) {
            EdgeHtmlBuilder.arrayFromServerFormatArray(
                drawnGraph.edges
            );
        };
        api.getEdgeDrawer = function(){
            return StraightArrowEdgeDrawer;
        };
        api.getEdgeSelector = function(){
            return GraphEdge;
        };
        api.getVertexSelector = function(){
            return GraphVertex;
        };
        api.canAddChildTree = function(){
            return false;
        };
        return api;

        function getDrawnGraphFromServer(centralVertexUri, depth, callback) {
            $.ajax({
                type:'GET',
                url:uri()
            }).success(callback);
            function uri(){
                return GraphService.graphUriForCentralVertexUriAndDepth(
                    centralVertexUri,
                    depth
                )  + "/drawn";
            }
        }

        function addVerticesToHtml(vertices) {
            $.each(vertices, function (uri, vertex) {
                addVertexServerFormatHavingRelativePosition(
                    vertex
                );
            });
        }

        function addVertexServerFormatHavingRelativePosition(vertexServerFormat) {
            var vertexHtmlFacade = VertexHtmlBuilder.withJsonHavingRelativePosition(
                vertexServerFormat
            ).create();
            GraphUi.addHtml(
                vertexHtmlFacade.getHtml()
            );
            return vertexHtmlFacade;
        }
    }
);