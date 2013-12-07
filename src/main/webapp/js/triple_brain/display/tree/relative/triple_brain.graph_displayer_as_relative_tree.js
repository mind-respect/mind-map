/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.vertex_html_builder_for_tree_displayer",
    "triple_brain.vertex_html_builder_view_only_for_relative_tree_displayer",
    "triple_brain.ui.graph",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.edge",
    "triple_brain.event_bus",
    "triple_brain.straight_and_square_edge_drawer",
    "triple_brain.id_uri",
    "triple_brain.relative_tree_vertex",
    "triple_brain.edge_html_builder_for_relative_tree",
    "triple_brain.edge_html_builder_view_only_for_relative_tree_displayer",
    "triple_brain.tree_edge",
    "triple_brain.point",
    "triple_brain.relative_tree_vertex_menu_handler",
    "triple_brain.tree_edge_menu_handler",
    "triple_brain.relative_tree_graph_menu_handler",
    "triple_brain.graph_element_menu_handler"
], function ($, Graph, TreeDisplayerCommon, VertexHtmlBuilder, ViewOnlyVertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, StraightAndSquareEdgeDrawer, IdUriUtils, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly,TreeEdge, Point, RelativeTreeVertexMenuHandler, TreeEdgeMenuHandler, RelativeTreeGraphMenuHandler, GraphElementMenuHandler) {
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
        Graph.getForCentralVertexUriAndDepth(
            centralVertexUri,
            depth,
            function (graph) {
                var drawnTree = new TreeMaker()
                    .makeForCenterVertex(
                    graph,
                    centralVertexUri
                );
                callback(drawnTree);
            }
        );
    };
    api.canAddChildTree = function(){
        return true;
    };
    api.addChildTree = function(parentVertex, callback){
        var depth = 1;
        var parentUri = parentVertex.getUri();
        Graph.getForCentralVertexUriAndDepth(
            parentUri,
            depth,
            function (serverGraph) {
                var treeMaker = new TreeMaker(VertexHtmlBuilder);
                removeGrandParentFromServerGraph();
                var parentVertexServerFormat = serverGraph.vertices[parentUri];
                TreeDisplayerCommon.defineChildrenInVertices(
                    serverGraph,
                    parentUri
                );
                var parentVertexId = parentVertex.getId();
                parentVertexServerFormat.uiIds = [
                    parentVertexId
                ];
                serverGraph.vertices[parentUri] = parentVertexServerFormat;
                treeMaker.buildChildrenHtmlTreeRecursively(
                    parentVertex,
                    serverGraph.vertices,
                    parentVertex.getParentVertex().getUri()
                );
                parentVertex.setOriginalServerObject(
                    serverGraph.vertices[parentUri]
                );
                var isGoingLeft = parentVertex.isToTheLeft();
                parentVertex.visitChildren(function(child){
                    VertexHtmlBuilder.addDuplicateVerticesButtonIfApplicable(
                        child
                    );
                    if(isGoingLeft){
                        child.label().after(
                            child.getInBubbleContainer().find(
                                "> .note-button"
                            )
                        );
                    }
                });
                callback(serverGraph);
                function removeGrandParentFromServerGraph(){
                    var grandParentUri = parentVertex.getParentVertex().getUri();
                    delete serverGraph.vertices[grandParentUri];
                    serverGraph.edges = serverGraph.edges.filter(function(edge){
                        var sourceAndDestinationId = [
                            edge.source_vertex_id,
                            edge.destination_vertex_id
                        ];
                        return $.inArray(
                                grandParentUri,
                                sourceAndDestinationId
                            ) === -1
                    });
                }
            }
        );
    };
    api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
        var depth = 1;
        Graph.getForCentralVertexUriAndDepth(
            destinationVertexUri,
            depth,
            function (serverGraph) {
                var treeMaker = new TreeMaker();
                var drawnTree = treeMaker.makeForNonCenterVertex(
                    serverGraph,
                    destinationVertexUri,
                    parentVertex
                );
                var farVertex = RelativeTreeVertex.withId(
                    drawnTree.vertices[destinationVertexUri].uiIds[0]
                );
                callback(drawnTree, farVertex);
            }
        );
    };
    api.name = function () {
        return "relative_tree";
    };
    api.addVertex = function (newVertex, parentVertex) {
        var treeMaker = new TreeMaker(
            VertexHtmlBuilder
        );
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
        var relativeVertex = RelativeTreeVertex.ofVertex(vertexHtmlFacade);
        if (relativeVertex.isToTheLeft()) {
            relativeVertex.adjustPosition(parentVertex.getHtml());
        }
        EdgeUi.redrawAllEdges();
        return vertexHtmlFacade;
    };
    api.allowsMovingVertices = function () {
        return false;
    };
    api.integrateEdgesOfServerGraphForViewOnly = function(drawnGraph){
        integrateEdgesOfDrawnGraph(
            drawnGraph,
            EdgeBuilderForViewOnly
        );
    };
    api.integrateEdgesOfServerGraph = function (drawnGraph) {
        integrateEdgesOfDrawnGraph(
            drawnGraph,
            EdgeBuilder
        );
    };
    api.addEdge = function (serverEdge, sourceVertex, destinationVertex) {
        return EdgeBuilder.get(
            serverEdge,
            sourceVertex,
            destinationVertex
        ).create();
    };
    api.getEdgeDrawer = function(){
        return StraightAndSquareEdgeDrawer;
    };
    api.getEdgeSelector = function(){
        return TreeEdge;
    };
    api.getVertexSelector = function(){
        return RelativeTreeVertex;
    };
    api.getVertexMenuHandler = function(){
        return RelativeTreeVertexMenuHandler;
    };
    api.getRelationMenuHandler = function(){
        return TreeEdgeMenuHandler;
    };
    api.getGraphElementMenuHandler = function(){
        return GraphElementMenuHandler;
    };
    api.getGraphMenuHandler = function(){
        return RelativeTreeGraphMenuHandler;
    };
    api.buildIncludedGraphElementsView = function(vertex, container){
        var serverGraph = {
            vertices : vertex.getIncludedVertices(),
            edges : vertex.getIncludedEdges()
        };
        return new TreeMaker().makeForIncludedVerticesView(
            serverGraph,
            container
        );
    };
    return api;

    function integrateEdgesOfDrawnGraph(drawnGraph, edgeBuilder){
        var addedUids = {};
        integrateEdges();
        function integrateEdges(){
            $.each(drawnGraph.edges, function(){
                var edgeServerFormat = this;
                integrateIfApplicableEdgesOfVertex(
                    vertexWithUri(
                        edgeServerFormat.source_vertex_id
                    )
                );
                integrateIfApplicableEdgesOfVertex(
                    vertexWithUri(
                        edgeServerFormat.destination_vertex_id
                    )
                );
            });
        }
        function integrateIfApplicableEdgesOfVertex(vertexServerFormat){
            $.each(vertexServerFormat.uiIds, function(){
                var uiId = this + "";
                if(addedUids[uiId] !== undefined){
                    return;
                }
                integrateEdgesOfVertex(RelativeTreeVertex.withId(
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
                edgeBuilder.get(
                    neighborInfo.edge,
                    vertex,
                    RelativeTreeVertex.withId(
                        neighborInfo[vertex.getId()].vertexHtmlId
                    )
                ).create();
            });
        }
        function vertexWithUri(vertexId) {
            return drawnGraph.vertices[vertexId]
        }
    }

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

    function TreeMaker(_htmlBuilder) {
        var self = this;
        this.makeForIncludedVerticesView = function(serverGraph, container){
            var graphOffset = Point.fromCoordinates(
                container.width() / 2,
                container.height() / 2
            );
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset:graphOffset
                });
            container.append(
                verticesContainer
            );
            var centralVertexUri = Object.keys(
                serverGraph.vertices
            )[0];
            _htmlBuilder = ViewOnlyVertexHtmlBuilder;
            resetIncludedVerticesDrawProperties();
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                verticesContainer,
                true
            );
            function resetIncludedVerticesDrawProperties(){
                $.each(serverGraph.vertices, function(){
                    var vertex = this;
                    vertex.added = vertex.neighbors = vertex.uiIds = undefined;
                });
            }
        };
        this.makeForCenterVertex = function(serverGraph, centralVertexUri){
            var graphOffset = GraphUi.offset();
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset:graphOffset
                });
            GraphUi.addHtml(
                verticesContainer
            );
            _htmlBuilder = VertexHtmlBuilder;
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                verticesContainer,
                true
            );
        };
        this.makeForNonCenterVertex = function(serverGraph, centralVertexUri, parentVertex){
            var treeContainer = $(RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge()
            );
            removeAlreadyInGraphVerticesInEdgesArray();
            _htmlBuilder = VertexHtmlBuilder;
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
                        return RelativeTreeVertex.withUri(sourceVertexUri).length > 0 ||
                            RelativeTreeVertex.withUri(sourceVertexUri).length > 0;
                    }
                });
                serverGraph.edges = edgesWithoutDuplicateVertices;
            }
        };
        this.buildVertexHtmlIntoContainer = function (vertex, container) {
            var childVertexHtmlFacade = _htmlBuilder.withServerJson(
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
        this.buildChildrenHtmlTreeRecursively = function(parentVertexHtmlFacade, vertices, grandParentUri) {
            var serverParentVertex = vertexWithId(
                parentVertexHtmlFacade.getUri()
            );
            var childrenContainer = self.childrenVertexContainer(parentVertexHtmlFacade);
            $.each(serverParentVertex.neighbors, function () {
                var neighborInfo = this;
                var childInfo = vertexWithId(neighborInfo.vertexUri);
                if (grandParentUri === childInfo.uri || childInfo.added === true) {
                    return;
                }
                var vertexServerFormat = vertexWithId(childInfo.uri);
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
                    self.buildChildrenHtmlTreeRecursively(
                        childVertexHtmlFacade,
                        vertices,
                        parentVertexHtmlFacade.getUri()
                    )
                );
            });
            return childrenContainer;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        };

        function makeInContainerUsingServerGraphAndCentralVertexUri(serverGraph, centralVertexUri, verticesContainer, canAddToLeft) {
            var vertices = serverGraph.vertices;
            TreeDisplayerCommon.defineChildrenInVertices(
                serverGraph,
                centralVertexUri
            );
            buildVerticesHtml();
            $.each($(".left-oriented .vertex"), function () {
                var relativeVertex = RelativeTreeVertex.withHtml(this);
                relativeVertex.adjustPosition();
                relativeVertex.label().after(
                    relativeVertex.getInBubbleContainer().find(
                        "> .note-button"
                    )
                );
            });
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(centralVertexUri);
                serverRootVertex.added = true;
                var rootVertex = _htmlBuilder.withServerJson(
                    serverRootVertex
                ).create();
                serverRootVertex.uiIds = [
                    rootVertex.getId()
                ];
                var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
                $(verticesContainer).append(vertexContainer);
                $(vertexContainer).append(rootVertex.getHtml());
                rootVertex.adjustWidth();
                var leftChildrenContainer;
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
                    self.buildChildrenHtmlTreeRecursively(
                        childHtmlFacade,
                        vertices,
                        serverRootVertex.uri
                    );
                }
            }
            return serverGraph;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        }
    }
});