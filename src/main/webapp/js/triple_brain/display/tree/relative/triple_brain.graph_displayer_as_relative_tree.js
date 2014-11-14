/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_service",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.vertex_html_builder",
    "triple_brain.vertex_html_builder_view_only",
    "triple_brain.ui.graph",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.edge_ui",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.relative_tree_vertex",
    "triple_brain.edge_html_builder",
    "triple_brain.edge_html_builder_view_only",
    "triple_brain.tree_edge",
    "triple_brain.point",
    "triple_brain.relative_tree_vertex_menu_handler",
    "triple_brain.group_relation_menu_handler",
    "triple_brain.tree_edge_menu_handler",
    "triple_brain.relative_tree_graph_menu_handler",
    "triple_brain.graph_element_menu_handler",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.edge",
    "triple_brain.group_relation_html_builder",
    "triple_brain.group_relation_ui",
    "triple_brain.schema_service",
    "triple_brain.schema",
    "triple_brain.schema_html_builder",
    "triple_brain.schema_ui",
    "triple_brain.schema_menu_handler",
    "triple_brain.property_html_builder",
    "triple_brain.property_menu_handler",
    "triple_brain.property_ui",
    "triple_brain.suggestion_bubble_html_builder",
    "triple_brain.suggestion_relation_builder",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.suggestion_bubble_menu_handler",
    "triple_brain.suggestion_relation_menu_handler",
    "triple_brain.triple_ui",
    "triple_brain.center_bubble"
], function ($, GraphService, TreeDisplayerCommon, VertexHtmlBuilder, ViewOnlyVertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, IdUriUtils, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly, TreeEdge, Point, RelativeTreeVertexMenuHandler, GroupRelationMenuHandler, TreeEdgeMenuHandler, RelativeTreeGraphMenuHandler, GraphElementMenuHandler, KeyboardActionsHandler, Edge, GroupRelationHtmlBuilder, GroupRelationUi, SchemaService, SchemaServerFacade, SchemaHtmlBuilder, SchemaUi, SchemaMenuHandler, PropertyHtmlBuilder, PropertyMenuHandler, PropertyUi, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SuggestionBubbleUi, SuggestionRelationUi, SuggestionBubbleMenuHandler, SuggestionRelationMenuHandler, TripleUi, CenterBubble) {
    KeyboardActionsHandler.init();
    var api = {};
    api.displayForVertexWithUri = function (centralVertexUri, callback, errorCallback) {
        GraphService.getForCentralVertexUri(
            centralVertexUri,
            function (graph) {
                new api.TreeMaker()
                    .makeForCenterVertex(
                    graph,
                    centralVertexUri
                );
                callback();
            },
            errorCallback
        );
    };
    api.displayForSchemaWithUri = function (uri, callback) {
        SchemaService.get(uri, function (schemaFromServer) {
            new api.TreeMaker().makeForSchema(
                SchemaServerFacade.fromServerFormat(schemaFromServer)
            );
            if (callback !== undefined) {
                callback();
            }
        });
    };
    api.canAddChildTree = function () {
        return true;
    };
    api.addChildTree = function (parentVertex) {
        var parentUri = parentVertex.getUri();
        GraphService.getForCentralVertexUri(
            parentUri,
            function (serverGraph) {
                var treeMaker = new api.TreeMaker(VertexHtmlBuilder);
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
                            var edgeFacade = Edge.fromServerFormat(
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
        GraphService.getForCentralVertexUri(
            destinationVertexUri,
            function (serverGraph) {
                var treeMaker = new api.TreeMaker(),
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

    api.showSuggestions = function (vertex) {
        $.each(vertex.suggestions(), function () {
            var serverFormat = this,
                suggestionBubble = api.addVertex(
                    serverFormat,
                    vertex,
                    SuggestionBubbleHtmlBuilder
                );
            SuggestionRelationBuilder.get(
                serverFormat,
                vertex,
                suggestionBubble
            ).create();
        });
    };
    api.addProperty = function (property, schema) {
        new api.TreeMaker().buildBubbleHtmlIntoContainer(
            property,
            schema,
            PropertyHtmlBuilder
        );
    };
    api.allowsMovingVertices = function () {
        return false;
    };

    api.addEdgeAndVertex = function (sourceBubbleUi, edge, destinationVertex) {
        var edgeUi = addEdge(
                edge,
                sourceBubbleUi
            ),
            destinationVertexUi = addVertex(
                destinationVertex,
                edgeUi,
                VertexHtmlBuilder
            );
        EdgeBuilder.afterChildBuilt(
            edgeUi,
            sourceBubbleUi,
            destinationVertexUi
        );
        var parentVertexUi = sourceBubbleUi.isGroupRelation() ?
            sourceBubbleUi.getParentVertex() : sourceBubbleUi;

        return new TripleUi.Self(
            parentVertexUi,
            edgeUi,
            destinationVertexUi
        );
    };
    api.getEdgeSelector = function () {
        return TreeEdge;
    };
    api.getVertexSelector = function () {
        return RelativeTreeVertex;
    };
    api.getSchemaSelector = function () {
        return SchemaUi;
    };
    api.getPropertySelector = function () {
        return PropertyUi;
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
    api.getGroupRelationMenuHandler = function () {
        return GroupRelationMenuHandler;
    };
    api.getSchemaMenuHandler = function () {
        return SchemaMenuHandler;
    };
    api.getPropertyMenuHandler = function () {
        return PropertyMenuHandler;
    };
    api.getGraphElementMenuHandler = function () {
        return GraphElementMenuHandler;
    };
    api.getGraphMenuHandler = function () {
        return RelativeTreeGraphMenuHandler;
    };
    api.getVertexSuggestionMenuHandler = function () {
        return SuggestionBubbleMenuHandler;
    };
    api.getRelationSuggestionMenuHandler = function () {
        return SuggestionRelationMenuHandler;
    };
    api.getVertexSuggestionSelector = function () {
        return SuggestionBubbleUi;
    };
    api.getRelationSuggestionSelector = function () {
        return SuggestionRelationUi;
    };
    api.buildIncludedGraphElementsView = function (vertex, container) {
        var serverGraph = {
            vertices: vertex.getIncludedVertices(),
            edges: vertex.getIncludedEdges()
        };
        return new api.TreeMaker().makeForIncludedVerticesView(
            serverGraph,
            container
        );
    };
    api.expandGroupRelation = function (groupRelationUi) {
        var treeMaker = new api.TreeMaker(VertexHtmlBuilder);
        var groupRelation = groupRelationUi.getGroupRelation();
        treeMaker.buildGroupRelation(
            groupRelation,
            groupRelationUi.getParentVertex(),
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

    function addVertex(newVertex, parentBubble, vertexHtmlBuilder) {
        if (vertexHtmlBuilder === undefined) {
            vertexHtmlBuilder = VertexHtmlBuilder
        }
        var treeMaker = new api.TreeMaker(
            vertexHtmlBuilder
        );
        newVertex.similarRelations = {};
        return treeMaker.buildBubbleHtmlIntoContainer(
            newVertex,
            parentBubble,
            treeMaker.getVertexHtmlBuilder(),
            GraphUi.generateBubbleHtmlId()
        );
    }

    function addEdge(serverEdge, sourceVertexUi) {
        var treeMaker = new api.TreeMaker();
        return treeMaker.buildBubbleHtmlIntoContainer(
            serverEdge,
            sourceVertexUi,
            EdgeBuilder
        );
    }

    api.TreeMaker = function (_htmlBuilder) {
        var self = this;
        this.edgeBuilder = EdgeBuilder;
        this.makeForSchema = function (schema) {
            _htmlBuilder = SchemaHtmlBuilder;
            buildRootBubble(
                schema,
                buildRootBubbleContainer()
            );
            var index = 0;
            $.each(schema.getProperties(), function () {
                var propertyServerFacade = this;
                propertyServerFacade.isLeftOriented = index % 2 !== 0;
                index++;
                self.buildBubbleHtmlIntoContainer(
                    propertyServerFacade,
                    self.rootBubble,
                    PropertyHtmlBuilder
                );
            });
        };
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
            _htmlBuilder = VertexHtmlBuilder;
            return makeInContainerUsingServerGraphAndCentralVertexUri(
                serverGraph,
                centralVertexUri,
                buildRootBubbleContainer()
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
        this.buildBubbleHtmlIntoContainer = function (serverFormat, parentBubble, builder, htmlId) {
            var childVertexHtmlFacade = builder.withServerFacade(
                serverFormat
            ).create(htmlId);
            var childTreeContainer = RelativeTreeTemplates[
                    "vertex_tree_container"
                    ].merge(),
                isCenterVertex = parentBubble.isVertex() && parentBubble.isCenterVertex(),
                container;
            if (isCenterVertex) {
                var centerBubble = CenterBubble.usingBubble(parentBubble);
                if (centerBubble.shouldAddLeft()) {
                    container = centerBubble.getLeftContainer();
                    serverFormat.isLeftOriented = true;
                } else {
                    container = centerBubble.getRightContainer();
                    serverFormat.isLeftOriented = false;
                }
            } else {
                container = self.childContainer(parentBubble);
                serverFormat.isLeftOriented = parentBubble.getOriginalServerObject().isLeftOriented;
            }

            container.append(
                childTreeContainer
            ).append("<span class='clear-fix'>");

            var vertexContainer = RelativeTreeTemplates[
                "vertex_container"
                ].merge();
            childTreeContainer.append(
                vertexContainer
            );
            childTreeContainer[
                serverFormat.isLeftOriented ? "append" : "prepend"
                ](
                RelativeTreeTemplates[
                    "vertical_border"
                    ].merge()
            );
            vertexContainer.append(
                childVertexHtmlFacade.getHtml()
            );
            childVertexHtmlFacade.readjustLabelWidth();
            self.addChildrenContainerToBubble(childVertexHtmlFacade, serverFormat.isLeftOriented);
            return childVertexHtmlFacade;
        };
        this.addChildrenContainerToBubble = function (vertexHtmlFacade, toLeft) {
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
        this.childContainer = function (bubbleUi) {
            return bubbleUi.getHtml().closest(".vertex-container"
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
        this.buildGroupRelation = function (groupRelation, parentVertexUi, isToTheLeft) {
            $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
                $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                    var vertex = vertexAndEdge.vertex,
                        edge = vertexAndEdge.edge;
                    edge.isLeftOriented = vertex.isLeftOriented = isToTheLeft;
                    var edgeUi = self.buildBubbleHtmlIntoContainer(
                        edge,
                        parentVertexUi,
                        self.edgeBuilder
                    );
                    var childVertexHtmlFacade = self.buildBubbleHtmlIntoContainer(
                        vertex,
                        edgeUi,
                        _htmlBuilder,
                        vertexHtmlId
                    );
                    self.edgeBuilder.afterChildBuilt(
                        edgeUi,
                        parentVertexUi,
                        childVertexHtmlFacade
                    );
                    var treeContainer = childVertexHtmlFacade.getHtml().closest(
                        ".vertex-tree-container"
                    );
                    treeContainer[vertex.isLeftOriented ? "prepend" : "append"](
                        buildChildrenHtmlTreeRecursively(
                            childVertexHtmlFacade
                        )
                    );
                });
            });
        };
        function buildRootBubbleContainer() {
            var graphOffset = GraphUi.offset();
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge({
                    offset: graphOffset
                });
            GraphUi.addHtml(
                verticesContainer
            );
            return verticesContainer;
        }

        function buildChildrenHtmlTreeRecursively(parentBubbleUi) {
            var serverParentVertex = parentBubbleUi.getOriginalServerObject();
            $.each(serverParentVertex.similarRelations, function (key, groupRelation) {
                self.buildGroupRelation(
                    groupRelation,
                    parentBubbleUi,
                    serverParentVertex.isLeftOriented
                );
            });
        }

        function buildRootBubble(serverFacade, bubblesContainer) {
            self.rootBubble = _htmlBuilder.withServerFacade(
                serverFacade
            ).create(GraphUi.generateBubbleHtmlId());
            var bubbleContainer = $(
                RelativeTreeTemplates["vertex_container"].merge()
            );
            bubblesContainer.append(bubbleContainer);
            bubbleContainer.append(self.rootBubble.getHtml());
            self.rootBubble.readjustLabelWidth();
            self.leftChildrenContainer = self.addChildrenContainerToBubble(
                self.rootBubble,
                true
            ).addClass("left-oriented");
            self.rightChildrenContainer = self.addChildrenContainerToBubble(
                self.rootBubble,
                false
            );
        }

        function makeInContainerUsingServerGraphAndCentralVertexUri(serverGraph, rootVertexUri, verticesContainer) {
            TreeDisplayerCommon.enhancedVerticesInfo(
                serverGraph,
                rootVertexUri
            );
            var vertices = serverGraph.vertices;
            buildVerticesHtml();
            return verticesContainer;
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(rootVertexUri);
                buildRootBubble(
                    serverRootVertex,
                    verticesContainer
                );
                self.rootBubble.getHtml().addClass("center-vertex");
                $.each(serverRootVertex.similarRelations, function (key, groupRelation) {
                    if (groupRelation.hasMultipleVertices()) {
                        self.buildBubbleHtmlIntoContainer(
                            groupRelation,
                            self.rootBubble,
                            GroupRelationHtmlBuilder
                        );
                        return;
                    }
                    $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
                        $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                            var vertex = vertexAndEdge.vertex,
                                edgeUi = self.buildBubbleHtmlIntoContainer(
                                    vertexAndEdge.edge,
                                    self.rootBubble,
                                    self.edgeBuilder
                                ),
                                childHtmlFacade = self.buildBubbleHtmlIntoContainer(
                                    vertex,
                                    edgeUi,
                                    _htmlBuilder,
                                    vertexHtmlId
                                );
                            self.edgeBuilder.afterChildBuilt(
                                edgeUi,
                                self.rootBubble,
                                childHtmlFacade
                            );
                            self.buildChildrenHtmlTreeRecursively(
                                childHtmlFacade,
                                vertices
                            );
                        });
                    });
                });
            }

            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        }
    };
    return api;
});