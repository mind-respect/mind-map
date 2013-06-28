/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.vertex_html_builder_for_tree_displayer",
    "triple_brain.ui.graph",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.edge",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex",
    "triple_brain.ui.arrow_line",
    "triple_brain.id_uri",
    "triple_brain.relative_vertex",
    "triple_brain.edge_html_builder_for_relative_tree"
], function ($, Graph, TreeDisplayerCommon, VertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, VertexUi, ArrowLine, IdUriUtils, RelativeVertex, EdgeBuilder) {
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
        Graph.getForCentralVertexUriAndDepth(
            centralVertexUri,
            depth,
            function (graph) {
                var drawnTree = new TreeMaker()
                    .makeForAbsoluteCenterVertexInContainerUsingServerGraphAndCentralVertexUri(
                    graph,
                    centralVertexUri
                );
                callback(drawnTree);
            }
        );
    };
    api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
        Graph.getForCentralVertexUriAndDepth(
            destinationVertexUri,
            5,
            function (serverGraph) {
                var treeMaker = new TreeMaker();
                var drawnTree = treeMaker.makeForRelativeCenterVertexInContainerUsingServerGraphAndCentralVertexUri(
                    serverGraph,
                    destinationVertexUri,
                    parentVertex
                );
                callback(drawnTree);
            }
        );
    };
    api.name = function () {
        return "relative_tree";
    };
    api.addVertex = function (newVertex, parentVertex) {
        var treeMaker = new TreeMaker();
        var container;
        if (parentVertex.isCenterVertex()) {
            container = shouldAddLeft() ?
                leftVerticesContainer() :
                rightVerticesContainer();
        } else {
            container = treeMaker.childrenVertexContainer(parentVertex);
        }
        newVertex.neighbors = [];
        var vertexHtmlFacade = treeMaker.buildVertexHtmlIntoContainer(
            newVertex,
            container
        );
        var relativeVertex = RelativeVertex.withVertex(vertexHtmlFacade);
        if (relativeVertex.isToTheLeft()) {
            relativeVertex.adjustPosition(parentVertex.getHtml());
        }
        EdgeUi.redrawAllEdges();
        return vertexHtmlFacade;
    };
    api.allowsMovingVertices = function () {
        return false;
    };
    api.integrateEdgesOfServerGraph = function (drawnGraph) {
        var addedUids = {};
        integrateEdges();
        EdgeUi.redrawAllEdges();
        function integrateEdges(){
            $.each(drawnGraph.edges, function(){
                var edgeServerFormat = this;
                integrateIfApplicationEdgesOfVertexServerFormatted(
                    vertexWithUri(
                        edgeServerFormat.source_vertex_id
                    )
                );
                integrateIfApplicationEdgesOfVertexServerFormatted(
                    vertexWithUri(
                        edgeServerFormat.destination_vertex_id
                    )
                );
            });
        }
        function integrateIfApplicationEdgesOfVertexServerFormatted(vertexServerFormat){
            $.each(vertexServerFormat.uiIds, function(){
                var uiId = this;
                if(addedUids[uiId] !== undefined){
                    return;
                }
                integrateEdgesOfVertex(VertexUi.withId(
                    uiId
                ));
                addedUids[uiId] = {};
            });
        }

        function integrateEdgesOfVertex(vertex) {
            var vertexServerFormat = vertex.getOriginalServerObject();
            $.each(vertexServerFormat.neighbors, function () {
                var neighborInfo = this;
                if (neighborInfo[vertex.getId()] === undefined) {
                    return;
                }
                EdgeBuilder.get(
                    neighborInfo.edge,
                    vertex,
                    VertexUi.withId(neighborInfo[vertex.getId()].vertexHtmlId)
                ).create();
            });
        }
        function vertexWithUri(vertexId) {
            return drawnGraph.vertices[vertexId]
        }
    };
    api.addEdge = function (serverEdge, sourceVertex, destinationVertex) {
        return EdgeBuilder.get(
            serverEdge,
            sourceVertex,
            destinationVertex
        ).create();
    };
    return api;
    function shouldAddLeft() {
        var numberOfDirectChildrenLeft = $(leftVerticesContainer()).children().length;
        var numberOfDirectChildrenRight = $(rightVerticesContainer()).children().length;
        return  numberOfDirectChildrenLeft < numberOfDirectChildrenRight;
    }

    function leftVerticesContainer() {
        return $(
            ".vertices-children-container.left-oriented"
        );
    }

    function rightVerticesContainer() {
        return $(".center-vertex").closest(".vertex-container").siblings(
            ".vertices-children-container:not(.left-oriented):first"
        );
    }

    function TreeMaker() {
        var self = this;
        this.makeForAbsoluteCenterVertexInContainerUsingServerGraphAndCentralVertexUri = function(serverGraph, centralVertexUri){
            var graphOffset = GraphUi.offset();
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset:graphOffset
                });
            GraphUi.addHTML(
                verticesContainer
            );
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                verticesContainer,
                true
            );
        };
        this.makeForRelativeCenterVertexInContainerUsingServerGraphAndCentralVertexUri = function(serverGraph, centralVertexUri, parentVertex){
            var treeContainer = $(RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge()
            );
            removeAlreadyInGraphVerticesInEdgesArray();
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                treeContainer.appendTo(
                    self.childrenVertexContainer(
                        parentVertex
                    )
                ),
                false
            );
            function removeAlreadyInGraphVerticesInEdgesArray(){
                var edgesWithoutDuplicateVertices = [];
                $.each(serverGraph.edges, function(){
                    var edgeServerFormat = this;
                    var sourceVertexUri = edgeServerFormat.source_vertex_id;
                    var destinationVertexUri = edgeServerFormat.destination_vertex_id;
                    if(oneOfVerticesIsCentralVertex()){
                        edgesWithoutDuplicateVertices.push(
                            edgeServerFormat
                        );
                        return;
                    }
                    if(!oneOfVerticesIsAlreadyInGraph()){
                        edgesWithoutDuplicateVertices.push(
                            edgeServerFormat
                        );
                    }
                    function oneOfVerticesIsCentralVertex(){
                        return sourceVertexUri === centralVertexUri ||
                            destinationVertexUri === centralVertexUri;
                    }
                    function oneOfVerticesIsAlreadyInGraph(){
                        return VertexUi.withUri(sourceVertexUri).length > 0 ||
                            VertexUi.withUri(sourceVertexUri).length > 0;
                    }
                });
                serverGraph.edges = edgesWithoutDuplicateVertices;
            }
        };
        this.buildVertexHtmlIntoContainer = function (vertex, container) {
            var childVertexHtmlFacade = VertexHtmlBuilder.withServerJson(
                vertex
            ).create();
            var childTreeContainer = RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge();
            $(container).append(
                childTreeContainer
            );
            var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
            childTreeContainer.append(
                vertexContainer
            );
            vertexContainer.append(
                childVertexHtmlFacade.getHtml()
            );
            childVertexHtmlFacade.adjustWidth();
            self.addChildrenContainerToVertex(childVertexHtmlFacade);
            return childVertexHtmlFacade;
        };
        this.addChildrenContainerToVertex = function (vertexHtmlFacade) {
            var childrenContainer = RelativeTreeTemplates[
                "vertices_children_container"
                ].merge();
            vertexHtmlFacade.getHtml().closest(
                ".vertex-tree-container, .root-vertex-super-container"
            ).append(childrenContainer);
            return childrenContainer;
        };
        this.childrenVertexContainer = function (vertexHtmlFacade) {
            return $(vertexHtmlFacade.getHtml()).closest(".vertex-container"
            ).siblings(".vertices-children-container");
        };
        function makeInContainerUsingServerGraphAndCentralVertexUri(serverGraph, centralVertexUri, verticesContainer, canAddToLeft) {
            var vertices = serverGraph.vertices;
            TreeDisplayerCommon.defineChildrenInVertices(
                serverGraph,
                centralVertexUri
            );
            buildVerticesHtml();
            $.each($(".left-oriented .vertex"), function () {
                var relativeVertex = RelativeVertex.withVertexHtml(this);
                relativeVertex.adjustPosition();
            });
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(centralVertexUri);
                serverRootVertex.added = true;
                var rootVertex = VertexHtmlBuilder.withServerJson(
                    serverRootVertex
                ).create();
                serverRootVertex.uiIds = [
                    rootVertex.getId()
                ];
                var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
                $(verticesContainer).append(vertexContainer);
                $(vertexContainer).append(rootVertex.getHtml());
                rootVertex.adjustWidth();
                var leftChildrenContainer
                if(canAddToLeft){
                    leftChildrenContainer = self.addChildrenContainerToVertex(
                        rootVertex
                    );
                    $(leftChildrenContainer).addClass("left-oriented");
                }
                var rightChildrenContainer = self.addChildrenContainerToVertex(
                    rootVertex
                );
                for (var i = 0; i < serverRootVertex.neighbors.length; i++) {
                    var isLeftOriented = i % 2 != 0;
                    var childVertex = vertexWithId(serverRootVertex.neighbors[i].vertexUri);
                    childVertex.added = true;
                    var container = canAddToLeft && isLeftOriented ?
                        leftChildrenContainer :
                        rightChildrenContainer;
                    var childHtmlFacade = self.buildVertexHtmlIntoContainer(
                        childVertex,
                        container
                    );
                    if(childVertex.uiIds === undefined){
                        childVertex.uiIds = [];
                    }
                    childVertex.uiIds.push(
                        childHtmlFacade.getId()
                    );
                    serverRootVertex.neighbors[i][rootVertex.getId()] = {
                        vertexHtmlId:childHtmlFacade.getId()
                    };
                    buildChildrenHtmlTreeRecursively(
                        childHtmlFacade,
                        serverRootVertex.id
                    );
                }
                function buildChildrenHtmlTreeRecursively(parentVertexHtmlFacade, grandParentUri) {
                    var serverParentVertex = vertexWithId(
                        parentVertexHtmlFacade.getUri()
                    );
                    var childrenContainer = self.childrenVertexContainer(parentVertexHtmlFacade);
                    $.each(serverParentVertex.neighbors, function () {
                        var neighborInfo = this;
                        var childInfo = vertexWithId(neighborInfo.vertexUri);
                        if (grandParentUri === childInfo.id || childInfo.added === true) {
                            return;
                        }
                        var vertexServerFormat = vertexWithId(childInfo.id);
                        var childVertexHtmlFacade = self.buildVertexHtmlIntoContainer(
                            vertexServerFormat,
                            childrenContainer
                        );
                        if(vertexServerFormat.uiIds === undefined){
                            vertexServerFormat.uiIds = [];
                        }
                        vertexServerFormat.uiIds.push(
                            childVertexHtmlFacade.getId()
                        );
                        neighborInfo[parentVertexHtmlFacade.getId()] = {
                            vertexHtmlId:childVertexHtmlFacade.getId()
                        };
                        var treeContainer = childVertexHtmlFacade.getHtml().closest(
                            ".vertex-tree-container"
                        );
                        childInfo.added = true;
                        $(treeContainer).append(
                            buildChildrenHtmlTreeRecursively(
                                childVertexHtmlFacade,
                                parentVertexHtmlFacade.getUri()
                            )
                        );
                    });
                    return childrenContainer;
                }
            }

            return serverGraph;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        }
    }
});