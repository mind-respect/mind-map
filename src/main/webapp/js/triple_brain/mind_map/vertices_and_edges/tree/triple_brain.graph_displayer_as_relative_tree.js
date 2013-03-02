/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.ui.vertex_html_builder",
    "triple_brain.ui.graph",
    "triple_brain.relative_tree_displayer_templates"
], function ($, Graph, TreeDisplayerCommon, VertexHtmlBuilder, GraphUi, RelativeTreeTemplates) {
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
        Graph.getForCentralVertexUriAndDepth(centralVertexUri, depth, function (graph) {
            var drawnTree = new TreeMakerFromServerGraph(
                centralVertexUri,
                graph
            ).make();
            callback(drawnTree);
        });
    };
    api.addVertex = function (newVertex, parentVertex) {

    };
    api.allowsMovingVertices = function(){
        return false;
    }
    return api;
    function TreeMakerFromServerGraph(centralVertexUri, serverGraph) {
        var vertices = serverGraph.vertices;
        this.make = function () {
            TreeDisplayerCommon.defineChildrenInVertices(
                serverGraph,
                centralVertexUri
            );
            buildVerticesHtml();
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(centralVertexUri);
                var rootVertex = VertexHtmlBuilder.withJsonHavingNoPosition(
                    serverRootVertex
                ).create();
                var graphOffset = GraphUi.offset();
                var verticesContainer = RelativeTreeTemplates[
                    "root_vertex_super_container"
                    ].merge({
                    offset:graphOffset
                });
                GraphUi.addHTML(
                    verticesContainer
                );
                var vertexContainer= RelativeTreeTemplates["vertex_container"].merge();
                $(verticesContainer).append(vertexContainer);
                $(vertexContainer).append(rootVertex.getHtml());
                var leftChildrenContainer = addChildrenContainerToVertex(
                    rootVertex
                );
                var rightChildrenContainer = addChildrenContainerToVertex(
                    rootVertex
                );
                for(var i = 0 ; i < serverRootVertex.children.length; i++){
                    var isLeftOriented = i % 2 != 0;
                    var childVertex = vertexWithId(serverRootVertex.children[i]);
                    var container = isLeftOriented ?
                        leftChildrenContainer:
                        rightChildrenContainer;
                    buildVertexHtmlIntoContainer(
                        childVertex,
                        container,
                        isLeftOriented
                    );
                }

                function buildChildrenHtmlTreeRecursively(parentVertexHtmlFacade, isLeftOriented) {
                    var serverParentVertex = vertexWithId(
                        parentVertexHtmlFacade.getUri()
                    );
                    var childrenContainer = addChildrenContainerToVertex(
                        parentVertexHtmlFacade
                    );
                    $.each(serverParentVertex.children, function () {
                        buildVertexHtmlIntoContainer(
                            vertexWithId(this),
                            childrenContainer,
                            isLeftOriented
                        );
                    });
                    return childrenContainer;
                }

                function addChildrenContainerToVertex(vertexHtmlFacade){
                    var childrenContainer = RelativeTreeTemplates[
                        "vertices_children_container"
                        ].merge();
                    vertexHtmlFacade.getHtml().closest(
                        ".vertices-children-container, .root-vertex-super-container"
                    ).append(childrenContainer);
                    return childrenContainer;
                }

                function buildVertexHtmlIntoContainer(vertex, container, isLeftOriented){
                    var childVertexHtmlFacade = VertexHtmlBuilder.withJsonHavingNoPosition(
                        vertex
                    ).create();
                    var childTreeContainer = RelativeTreeTemplates[
                        "vertex_tree_container"
                        ].merge();
                    container.append(
                        childTreeContainer
                    );
                    if(isLeftOriented){
                        $(childTreeContainer).addClass("left-oriented");
                    }
                    var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
                    childTreeContainer.append(
                        vertexContainer
                    );
                    vertexContainer.append(
                        childVertexHtmlFacade.getHtml()
                    );
                    childTreeContainer.append(
                        buildChildrenHtmlTreeRecursively(childVertexHtmlFacade, isLeftOriented)
                    );
                }
            }
            return serverGraph;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        };
    }
});