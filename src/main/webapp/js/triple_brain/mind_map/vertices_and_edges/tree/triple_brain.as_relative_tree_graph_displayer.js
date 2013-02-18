/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.as_tree_graph_displayer_common",
    "triple_brain.mind-map_template"
], function($, Graph, TreeDisplayerCommon, MindMapTemplate){
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
        var api = {};
        api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
            Graph.getForCentralVertexUriAndDepth(centralVertexUri, depth, function(graph){
                var drawnTree = new TreeMakerFromServerGraph(
                    centralVertexUri,
                    graph
                ).make();
                callback(drawnTree);
            });
        };
        return api;
        function TreeMakerFromServerGraph(centralVertexUri, serverGraph) {
            var vertices = serverGraph.vertices;
            this.make = function () {
                TreeDisplayerCommon.defineChildrenInVertices(
                    serverGraph,
                    centralVertexUri
                );
                buildVerticesHtml();
                function buildVerticesHtml(){
                    var vertices = $("<div id='vertices'></div>");
                    visitTreeRecursively(
                        vertexWithId(centralVertexUri),
                        vertices
                    );
                    function visitTreeRecursively(rootVertex, rootDiv){

                    }
                    function buildVertexDivInDiv(vertex, div){
                        $(div).append(
                            MindMapTemplate.relative_vertex.merge({
                                id:vertex
                            })
                        );
                    }
                }

                return serverGraph;
                function vertexWithId(vertexId){
                    return vertices[vertexId]
                }
            };
        }
    };
    return api;
});