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
    "triple_brain.id_uri",
    "triple_brain.relative_tree_vertex",
    "triple_brain.edge_html_builder_for_relative_tree",
    "triple_brain.edge_html_builder_view_only_for_relative_tree_displayer",
    "triple_brain.tree_edge",
    "triple_brain.point",
    "triple_brain.relative_tree_vertex_menu_handler",
    "triple_brain.group_relation_menu_handler",
    "triple_brain.tree_edge_menu_handler",
    "triple_brain.relative_tree_graph_menu_handler",
    "triple_brain.graph_element_menu_handler",
    "triple_brain.relative_tree_keyboard_actions_handler",
    "triple_brain.edge_server_facade",
    "triple_brain.group_relation_html_builder_for_tree_displayer",
    "triple_brain.ui.group_relation"
], function ($, Graph, TreeDisplayerCommon, VertexHtmlBuilder, ViewOnlyVertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, IdUriUtils, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly, TreeEdge, Point, RelativeTreeVertexMenuHandler, GroupRelationMenuHandler, TreeEdgeMenuHandler, RelativeTreeGraphMenuHandler, GraphElementMenuHandler, KeyboardActionsHandler, EdgeServerFacade, GroupRelationHtmlBuilder, GroupRelationUi) {
    KeyboardActionsHandler.init();
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback, errorCallback) {
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
            },
            errorCallback
        );
    };
    api.canAddChildTree = function () {
        return true;
    };
    api.addChildTree = function (parentVertex) {
        var depth = 1;
        var parentUri = parentVertex.getUri();
        Graph.getForCentralVertexUriAndDepth(
            parentUri,
            depth,
            function (serverGraph) {
                var treeMaker = new TreeMaker(VertexHtmlBuilder);
                var nbRelationsWithGrandParent = removeRelationWithGrandParentFromServerGraph();
                TreeDisplayerCommon.enhancedVerticesInfo(
                    serverGraph,
                    parentUri
                );
                var parentVertexServerFormat = serverGraph.vertices[parentUri];
                parentVertexServerFormat.isLeftOriented = parentVertex.isToTheLeft();
                parentVertex.setOriginalServerObject(parentVertexServerFormat);
                if (nbRelationsWithGrandParent >= 1) {
                    treeMaker.buildChildrenHtmlTreeRecursivelyEvenIfGrandParentAndIncludingDuplicates(
                        parentVertex,
                        serverGraph.vertices
                    );
                } else {
                    treeMaker.buildChildrenHtmlTreeRecursively(
                        parentVertex,
                        serverGraph.vertices
                    );
                }
                parentVertex.visitVerticesChildren(VertexHtmlBuilder.completeBuild);
                function removeRelationWithGrandParentFromServerGraph() {
                    var relationWithGrandParentUri = parentVertex.getRelationWithParent().getUri();
                    var grandParentUri = parentVertex.getParentVertex().getUri();
                    var nbRelationsWithGrandParent = 0;
                    serverGraph.edges = getFilteredEdges();
                    if (1 === nbRelationsWithGrandParent) {
                        delete serverGraph.vertices[grandParentUri];
                    }
                    return nbRelationsWithGrandParent - 1;

                    function getFilteredEdges() {
                        var filteredEdges = {};
                        $.each(serverGraph.edges, function () {
                            var edge = this;
                            var edgeFacade = EdgeServerFacade.fromServerFormat(
                                edge
                            );
                            var sourceAndDestinationId = [
                                edgeFacade.getSourceVertex().getUri(),
                                edgeFacade.getDestinationVertex().getUri()
                            ];
                            if ($.inArray(
                                grandParentUri,
                                sourceAndDestinationId
                            ) !== -1) {
                                nbRelationsWithGrandParent++;
                            }
                            if (relationWithGrandParentUri !== edgeFacade.getUri()) {
                                filteredEdges[
                                    edgeFacade.getUri()
                                    ] = edge
                            }
                        });
                        return filteredEdges;
                    }
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
                var treeMaker = new TreeMaker(),
                    drawnTree = treeMaker.makeForNonCenterVertex(
                        serverGraph,
                        destinationVertexUri,
                        parentVertex
                    ),
                    farVertex = RelativeTreeVertex.lastAddedWithUri(
                        destinationVertexUri
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
        var isCenterVertex = parentVertex.isVertex() && parentVertex.isCenterVertex();
        if(isCenterVertex) {
            if (shouldAddLeft()) {
                container = leftVerticesContainer();
                newVertex.isLeftOriented = true;
            } else {
                container = rightVerticesContainer();
                newVertex.isLeftOriented = false;
            }
        } else {
            container = treeMaker.childrenVertexContainer(parentVertex);
            newVertex.isLeftOriented = parentVertex.getOriginalServerObject().isLeftOriented;
        }
        newVertex.similarRelations = {};
        return treeMaker.buildVertexHtmlIntoContainer(
            newVertex,
            container,
            treeMaker.getVertexHtmlBuilder(),
            GraphUi.generateVertexHtmlId()
        );
    };
    api.allowsMovingVertices = function () {
        return false;
    };
    api.addEdge = function (serverEdge, sourceVertex, destinationVertex) {
        return EdgeBuilder.get(
            serverEdge,
            sourceVertex,
            destinationVertex
        ).create();
    };
    api.getEdgeSelector = function () {
        return TreeEdge;
    };
    api.getVertexSelector = function () {
        return RelativeTreeVertex;
    };
    api.getGroupRelationSelector = function () {
        return GroupRelationUi;
    };
    api.getVertexMenuHandler = function () {
        return RelativeTreeVertexMenuHandler;
    };
    api.getRelationMenuHandler = function () {
        return TreeEdgeMenuHandler;
    };
    api.getGroupRelationMenuHandler = function(){
        return GroupRelationMenuHandler;
    };
    api.getGraphElementMenuHandler = function () {
        return GraphElementMenuHandler;
    };
    api.getGraphMenuHandler = function () {
        return RelativeTreeGraphMenuHandler;
    };
    api.buildIncludedGraphElementsView = function (vertex, container) {
        var serverGraph = {
            vertices: vertex.getIncludedVertices(),
            edges: vertex.getIncludedEdges()
        };
        return new TreeMaker().makeForIncludedVerticesView(
            serverGraph,
            container
        );
    };
    api.expandGroupRelation = function (groupRelationUi) {
        var treeMaker = new TreeMaker(VertexHtmlBuilder);
        var groupRelation = groupRelationUi.getGroupRelation();
        treeMaker.buildGroupRelation(
            groupRelation,
            groupRelationUi.getParentVertex(),
            treeMaker.childrenVertexContainer(groupRelationUi),
            groupRelationUi.isToTheLeft()
        );
        $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
            $.each(verticesWithSameUri, function (vertexHtmlId) {
                VertexHtmlBuilder.completeBuild(
                    RelativeTreeVertex.withId(vertexHtmlId)
                );
            });
        });
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

    function TreeMaker(_htmlBuilder) {
        var self = this;
        this.edgeBuilder = EdgeBuilder;
        this.makeForIncludedVerticesView = function (serverGraph, container) {
            var graphOffset = Point.fromCoordinates(
                    container.width() / 2,
                    container.height() / 2
            );
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset: graphOffset
                });
            container.append(
                verticesContainer
            );
            var centralVertexUri = Object.keys(
                serverGraph.vertices
            )[0];
            _htmlBuilder = ViewOnlyVertexHtmlBuilder;
            self.edgeBuilder = EdgeBuilderForViewOnly;
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                verticesContainer
            );
        };
        this.makeForCenterVertex = function (serverGraph, centralVertexUri) {
            var graphOffset = GraphUi.offset();
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset: graphOffset
                });
            GraphUi.addHtml(
                verticesContainer
            );
            _htmlBuilder = VertexHtmlBuilder;
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                verticesContainer
            );
        };
        this.makeForNonCenterVertex = function (serverGraph, destinationVertexUri, parentVertex) {
            _htmlBuilder = VertexHtmlBuilder;
            TreeDisplayerCommon.enhancedVerticesInfo(serverGraph, parentVertex.getUri());
            var serverVertex = serverGraph.vertices[parentVertex.getUri()];
            serverVertex.isLeftOriented = parentVertex.isToTheLeft();
            parentVertex.setOriginalServerObject(serverVertex);
            self.buildChildrenHtmlTreeRecursively(parentVertex, serverGraph.vertices);
            parentVertex.visitVerticesChildren(VertexHtmlBuilder.completeBuild);
            return serverGraph;
        };
        this.buildVertexHtmlIntoContainer = function (vertex, container, builder, htmlId) {
            var childVertexHtmlFacade = builder.withServerFacade(
                vertex
            ).create(htmlId);
            var childTreeContainer = RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge();

            $(container).append(
                childTreeContainer
            ).append("<span class='clear-fix'>");

            var vertexContainer = RelativeTreeTemplates[
                "vertex_container"
                ].merge();
            childTreeContainer.append(
                vertexContainer
            );
            childTreeContainer[
                vertex.isLeftOriented ? "append" : "prepend"
                ](
                RelativeTreeTemplates[
                    "vertical_border"
                    ].merge()
            );
            vertexContainer.append(
                childVertexHtmlFacade.getHtml()
            );
            childVertexHtmlFacade.readjustLabelWidth();
            self.addChildrenContainerToVertex(childVertexHtmlFacade, vertex.isLeftOriented);
            return childVertexHtmlFacade;
        };
        this.addChildrenContainerToVertex = function (vertexHtmlFacade, toLeft) {
            var childrenContainer = $(RelativeTreeTemplates[
                "vertices_children_container"
                ].merge());
            vertexHtmlFacade.getHtml().closest(
                ".vertex-tree-container, .root-vertex-super-container"
            )[
                    toLeft && vertexHtmlFacade ? "prepend" : "append"
                ](childrenContainer);
            return childrenContainer;
        };
        this.childrenVertexContainer = function (vertexHtmlFacade) {
            return $(vertexHtmlFacade.getHtml()).closest(".vertex-container"
            ).siblings(".vertices-children-container");
        };
        this.buildChildrenHtmlTreeRecursivelyEvenIfGrandParentAndIncludingDuplicates = function (parentVertexHtmlFacade, vertices) {
            return buildChildrenHtmlTreeRecursively(
                parentVertexHtmlFacade,
                vertices
            );
        };
        this.buildChildrenHtmlTreeRecursively = function (parentVertexHtmlFacade, vertices) {
            buildChildrenHtmlTreeRecursively(
                parentVertexHtmlFacade,
                vertices
            );
        };
        this.getVertexHtmlBuilder = function () {
            return _htmlBuilder;
        };
        this.buildGroupRelation = function (groupRelation, parentVertexHtmlFacade, childrenContainer, isToTheLeft) {
            $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
                $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                    var vertex = vertexAndEdge.vertex,
                        edge = vertexAndEdge.edge;
                    vertex.isLeftOriented = isToTheLeft;
                    var childVertexHtmlFacade = self.buildVertexHtmlIntoContainer(
                        vertex,
                        childrenContainer,
                        _htmlBuilder,
                        vertexHtmlId
                    );
                    self.edgeBuilder.get(
                        edge,
                        parentVertexHtmlFacade,
                        childVertexHtmlFacade
                    ).create();
                    var treeContainer = childVertexHtmlFacade.getHtml().closest(
                        ".vertex-tree-container"
                    );
                    $(treeContainer)[vertex.isLeftOriented ? "prepend" : "append"](
                        buildChildrenHtmlTreeRecursively(
                            childVertexHtmlFacade
                        )
                    );
                });
            });
        };
        function buildChildrenHtmlTreeRecursively(parentVertexHtmlFacade) {
            var serverParentVertex = parentVertexHtmlFacade.getOriginalServerObject();
            var childrenContainer = self.childrenVertexContainer(parentVertexHtmlFacade);
            $.each(serverParentVertex.similarRelations, function (key, groupRelation) {
                self.buildGroupRelation(
                    groupRelation,
                    parentVertexHtmlFacade,
                    childrenContainer,
                    serverParentVertex.isLeftOriented
                );
            });
            return childrenContainer;
        }

        function makeInContainerUsingServerGraphAndCentralVertexUri(serverGraph, rootVertexUri, verticesContainer) {
            TreeDisplayerCommon.enhancedVerticesInfo(
                serverGraph,
                rootVertexUri
            );
            var vertices = serverGraph.vertices;
            buildVerticesHtml();
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(rootVertexUri),
                    rootVertex = _htmlBuilder.withServerFacade(
                        serverRootVertex
                    ).create(GraphUi.generateVertexHtmlId()),
                    vertexContainer = $(RelativeTreeTemplates["vertex_container"].merge());
                $(verticesContainer).append(vertexContainer);
                vertexContainer.append(rootVertex.getHtml());
                rootVertex.readjustLabelWidth();
                var leftChildrenContainer = self.addChildrenContainerToVertex(
                        rootVertex,
                        true
                    ).addClass("left-oriented"),
                    rightChildrenContainer = self.addChildrenContainerToVertex(
                        rootVertex,
                        false
                    );
                var index = 0;
                $.each(serverRootVertex.similarRelations, function (key, groupRelation) {
                    if (groupRelation.hasMultipleVertices()) {
                        groupRelation.isLeftOriented = index % 2 != 0;
                        var container = groupRelation.isLeftOriented ?
                            leftChildrenContainer :
                            rightChildrenContainer;
                        index++;
                        self.buildVertexHtmlIntoContainer(
                            groupRelation,
                            container,
                            GroupRelationHtmlBuilder
                        );
                        return;
                    }
                    $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
                        $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                            var vertex = vertexAndEdge.vertex;
                            vertex.isLeftOriented = index % 2 != 0;
                            index++;
                            var container = vertex.isLeftOriented ?
                                leftChildrenContainer :
                                rightChildrenContainer;
                            var childHtmlFacade = self.buildVertexHtmlIntoContainer(
                                vertex,
                                container,
                                _htmlBuilder,
                                vertexHtmlId
                            );
                            self.edgeBuilder.get(
                                vertexAndEdge.edge,
                                rootVertex,
                                childHtmlFacade
                            ).create();
                            self.buildChildrenHtmlTreeRecursively(
                                childHtmlFacade,
                                vertices
                            );
                        });
                    });
                });
            }

            return serverGraph;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        }
    }
});