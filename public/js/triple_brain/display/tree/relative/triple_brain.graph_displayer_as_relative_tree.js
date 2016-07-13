/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_service",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.vertex_html_builder",
    "triple_brain.vertex_html_builder_view_only",
    "triple_brain.graph_ui",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.edge_ui",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.relative_tree_vertex",
    "triple_brain.edge_html_builder",
    "triple_brain.edge_html_builder_view_only",
    "triple_brain.tree_edge",
    "triple_brain.point",
    "triple_brain.vertex_controller",
    "triple_brain.group_relation_controller",
    "triple_brain.edge_controller",
    "triple_brain.graph_controller",
    "triple_brain.graph_element_controller",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.edge",
    "triple_brain.identification",
    "triple_brain.group_relation_html_builder",
    "triple_brain.group_relation_ui",
    "triple_brain.schema_service",
    "triple_brain.schema",
    "triple_brain.schema_html_builder",
    "triple_brain.schema_ui",
    "triple_brain.schema_controller",
    "triple_brain.property_html_builder",
    "triple_brain.property_controller",
    "triple_brain.property_ui",
    "triple_brain.suggestion_bubble_html_builder",
    "triple_brain.suggestion_relation_builder",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.suggestion_vertex_controller",
    "triple_brain.suggestion_relation_controller",
    "triple_brain.triple_ui",
    "triple_brain.center_bubble",
    "triple_brain.selection_handler",
    "triple_brain.group_relation"
], function ($, GraphService, TreeDisplayerCommon, VertexHtmlBuilder, ViewOnlyVertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, IdUri, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly, TreeEdge, Point, VertexController, GroupRelationController, EdgeController, GraphController, GraphElementController, KeyboardActionsHandler, Edge, Identification, GroupRelationHtmlBuilder, GroupRelationUi, SchemaService, SchemaServerFacade, SchemaHtmlBuilder, SchemaUi, SchemaController, PropertyHtmlBuilder, PropertyController, PropertyUi, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SuggestionBubbleUi, SuggestionRelationUi, SuggestionVertexController, SuggestionRelationController, TripleUi, CenterBubble, SelectionHandler, GroupRelation) {
    "use strict";
    KeyboardActionsHandler.init();
    var api = {};
    api.displayForBubbleWithUri = function (centralBubbleUri, callback, errorCallback) {
        GraphService.getForCentralBubbleUri(
            centralBubbleUri,
            function (graph) {
                if (
                    IdUri.isEdgeUri(
                        centralBubbleUri
                    )
                ) {
                    var centerEdge = Edge.fromServerFormat(
                        graph.edges[centralBubbleUri]
                    );
                    centralBubbleUri = centerEdge.getSourceVertex().getUri();
                }
                new api.TreeMaker()
                    .makeForCenterVertex(
                        graph,
                        centralBubbleUri
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
        var deferred = $.Deferred();
        GraphService.getForCentralBubbleUri(
            parentVertex.getUri(),
            function (serverGraph) {
                api.addChildTreeUsingGraph(
                    parentVertex,
                    serverGraph
                );
                deferred.resolve();
                return parentVertex;
            }
        );
        return deferred.promise();
    };
    api.addChildTreeUsingGraph = function (parentVertex, serverGraph) {
        var parentUri = parentVertex.getUri();
        var treeMaker = new api.TreeMaker(VertexHtmlBuilder),
            nbRelationsWithGrandParent = removeRelationWithGrandParentFromServerGraph();
        TreeDisplayerCommon.enhancedVerticesInfo(
            serverGraph,
            parentUri
        );
        var parentVertexServerFormat = serverGraph.vertices[parentUri];
        parentVertex.getModel().isLeftOriented = parentVertex.isToTheLeft();
        parentVertex.getModel().similarRelations = parentVertexServerFormat.similarRelations;
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
        parentVertex.removeHiddenRelationsContainer();
        parentVertex.visitAllChild(function (childBubble) {
            if (childBubble.isGroupRelation()) {
                GroupRelationHtmlBuilder.completeBuild(childBubble);
            }
            flagSuggestionsToNotDisplayGivenParentAndChildVertex(
                parentVertex,
                childBubble.getModel()
            );
            if (childBubble.isRelation()) {
                childBubble.resetOtherInstances();
                childBubble.reviewInLabelButtonsVisibility();
                childBubble.visitAllChild(function (childVertex) {
                    VertexHtmlBuilder.completeBuild(
                        childVertex
                    );
                    childVertex.resetOtherInstances();
                    childVertex.reviewInLabelButtonsVisibility();
                });
            }
        });
        api.addSuggestionsToVertex(
            parentVertex.getModel().getSuggestions(),
            parentVertex
        );
        function removeRelationWithGrandParentFromServerGraph() {
            var parentRelation = parentVertex.getRelationWithUiParent();
            var relationWithGrandParentUri = parentRelation.getUri();
            var grandParent = parentVertex.getParentVertex();
            var grandParentUriToCompare = grandParent.getUri();
            var nbRelationsWithGrandParent = 0;
            serverGraph.edges = getFilteredEdges();
            if (1 === nbRelationsWithGrandParent) {
                delete serverGraph.vertices[grandParentUriToCompare];
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
                            grandParentUriToCompare,
                            sourceAndDestinationId
                        ) !== -1) {
                        nbRelationsWithGrandParent++;
                    }
                    if (relationWithGrandParentUri !== edgeFacade.getUri()) {
                        filteredEdges[
                            edgeFacade.getUri()
                            ] = edge;
                    }
                });
                return filteredEdges;
            }
        }
    };
    api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
        GraphService.getForCentralBubbleUri(
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
                    ),
                    relation = farVertex.getParentBubble();
                SelectionHandler.setToSingleRelation(relation);
                relation.centerOnScreenWithAnimation();
                farVertex.visitVerticesChildren(VertexHtmlBuilder.completeBuild);
                if (callback !== undefined) {
                    callback(drawnTree, farVertex);
                }
            }
        );
    };
    api.name = function () {
        return "relative_tree";
    };

    api.addSuggestionsToVertex = function (suggestions, vertex) {
        $.each(suggestions, function () {
            api.addSuggestionToVertex(
                this,
                vertex
            );
        });
    };
    api.addSuggestionToVertex = function (suggestion, vertex) {
        if (!suggestion.shouldDisplay()) {
            return;
        }
        var suggestionRelation = addEdge(
            suggestion,
            vertex,
            SuggestionRelationBuilder
        );
        suggestionRelation.getModel().isLeftOriented = suggestionRelation.getSuggestion().isLeftOriented;
        var suggestionBubble = addVertex(
            suggestion,
            suggestionRelation,
            SuggestionBubbleHtmlBuilder
        );
        suggestionBubble.getModel().isLeftOriented = suggestionBubble.getSuggestion().isLeftOriented;
        SuggestionBubbleHtmlBuilder.completeBuild(
            suggestionBubble
        );
        SuggestionRelationBuilder.afterChildBuilt(suggestionRelation);
        return new TripleUi.TripleUi(
            suggestionRelation,
            vertex,
            suggestionBubble
        );
    };
    api.addProperty = function (property, schema) {
        var propertyUi = addEdge(
            property,
            schema,
            PropertyHtmlBuilder
        );
        PropertyHtmlBuilder.completeBuild(propertyUi);
        return propertyUi;
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
        VertexHtmlBuilder.completeBuild(destinationVertexUi);
        var parentVertexUi = sourceBubbleUi.isGroupRelation() ?
            sourceBubbleUi.getParentVertex() : sourceBubbleUi;
        return new TripleUi.TripleUi(
            edgeUi,
            parentVertexUi,
            destinationVertexUi
        );
    };
    api.addSuggestionToSourceVertex = function (suggestion, parentVertexUi) {
        var treeMaker = new api.TreeMaker();
        var relationSuggestionUi = treeMaker.buildBubbleHtmlIntoContainer(
            suggestion, parentVertexUi, SuggestionRelationBuilder
        );
        relationSuggestionUi.getModel().isLeftOriented = relationSuggestionUi.getSuggestion().isLeftOriented;
        var destinationSuggestionUi = treeMaker.buildBubbleHtmlIntoContainer(
            suggestion, relationSuggestionUi, SuggestionBubbleHtmlBuilder
        );
        destinationSuggestionUi.getModel().isLeftOriented = destinationSuggestionUi.getSuggestion().isLeftOriented;
        SuggestionBubbleHtmlBuilder.completeBuild(
            destinationSuggestionUi
        );
        SuggestionRelationBuilder.afterChildBuilt(
            relationSuggestionUi
        );
        return new TripleUi.TripleUi(
            relationSuggestionUi,
            parentVertexUi,
            destinationSuggestionUi
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
        return VertexController;
    };
    api.getRelationMenuHandler = function () {
        return EdgeController;
    };
    api.getGroupRelationMenuHandler = function () {
        return GroupRelationController;
    };
    api.getSchemaMenuHandler = function () {
        return SchemaController;
    };
    api.getPropertyMenuHandler = function () {
        return PropertyController;
    };
    api.getGraphElementMenuHandler = function () {
        return GraphElementController;
    };
    api.getGraphMenuHandler = function () {
        return GraphController;
    };
    api.getVertexSuggestionController = function () {
        return SuggestionVertexController;
    };
    api.getRelationSuggestionMenuHandler = function () {
        return SuggestionRelationController;
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
        var treeMaker = new api.TreeMaker(VertexHtmlBuilder),
            groupRelation = groupRelationUi.getGroupRelation();
        treeMaker.buildGroupRelationToExpand(
            groupRelation,
            groupRelationUi
        );
        $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
            $.each(verticesWithSameUri, function (vertexHtmlId) {
                VertexHtmlBuilder.completeBuild(
                    RelativeTreeVertex.withId(vertexHtmlId)
                );
            });
        });
        groupRelationUi.removeHiddenRelationsContainer();
    };

    api.addNewGroupRelation = function (identification, parentBubble, addToLeft) {
        var treeMaker = new api.TreeMaker();
        treeMaker.setDirectionAroundCenter(
            addToLeft
        );
        var newGroupRelation = treeMaker.buildBubbleHtmlIntoContainer(
            GroupRelation.usingIdentification(identification),
            parentBubble,
            GroupRelationHtmlBuilder
        );
        GroupRelationHtmlBuilder.completeBuild(newGroupRelation);
        return newGroupRelation;
    };

    function addVertex(newVertex, parentBubble, htmlBuilder) {
        if (htmlBuilder === undefined) {
            htmlBuilder = VertexHtmlBuilder;
        }
        var treeMaker = new api.TreeMaker(
            htmlBuilder
        );
        newVertex.similarRelations = {};
        return treeMaker.buildBubbleHtmlIntoContainer(
            newVertex,
            parentBubble,
            htmlBuilder,
            GraphUi.generateBubbleHtmlId()
        );
    }

    function addEdge(serverEdge, sourceVertexUi, edgeUiBuilder) {
        if (edgeUiBuilder === undefined) {
            edgeUiBuilder = EdgeBuilder;
        }
        var treeMaker = new api.TreeMaker();
        return treeMaker.buildBubbleHtmlIntoContainer(
            serverEdge,
            sourceVertexUi,
            edgeUiBuilder
        );
    }

    api.TreeMaker = function (_htmlBuilder) {
        var self = this;
        this.edgeBuilder = EdgeBuilder;
        this.setDirectionAroundCenter = function (isToTheLeft) {
            this.forceToTheLeft = isToTheLeft;
        };
        this.makeForSchema = function (schema) {
            _htmlBuilder = SchemaHtmlBuilder;
            var container = buildRootBubbleContainer();
            buildRootBubble(
                schema,
                container
            );
            $.each(schema.getProperties(), function () {
                var propertyServerFacade = this;
                self.buildBubbleHtmlIntoContainer(
                    propertyServerFacade,
                    self.rootBubble,
                    PropertyHtmlBuilder
                );
            });
            return container;
        };
        this.makeForIncludedVerticesView = function (serverGraph, container) {
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge();
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
            parentVertex.setModel(serverVertex);
            self.buildChildrenHtmlTreeRecursively(parentVertex, serverGraph.vertices);
            parentVertex.visitVerticesChildren(function (vertex) {
                var wasAlreadyShownInGraph = serverGraph.vertices[vertex.getUri()] === undefined;
                if (wasAlreadyShownInGraph) {
                    return;
                }
                VertexHtmlBuilder.completeBuild(vertex);
                vertex.visitAllChild(function (childBubble) {
                    if (childBubble.isGroupRelation()) {
                        GroupRelationHtmlBuilder.completeBuild(childBubble);
                    }
                });
            });
            return serverGraph;
        };
        this.buildBubbleHtmlIntoContainer = function (serverFormat, parentBubble, builder, htmlId) {
            flagSuggestionsToNotDisplayGivenParentAndChildVertex(
                parentBubble.getModel(),
                serverFormat
            );
            var childTreeContainer = RelativeTreeTemplates[
                    "vertex_tree_container"
                    ].merge(),
                container;
            if (parentBubble.isCenterBubble()) {
                var centerBubble = CenterBubble.usingBubble(parentBubble);
                var addLeft = undefined === this.forceToTheLeft ?
                    centerBubble.shouldAddLeft() :
                    this.forceToTheLeft;
                container = addLeft ?
                    centerBubble.getLeftContainer() :
                    centerBubble.getRightContainer();
                serverFormat.isLeftOriented = addLeft;
            } else {
                container = self.childContainer(parentBubble);
                serverFormat.isLeftOriented = parentBubble.getModel().isLeftOriented;
            }
            var childVertexHtmlFacade = builder.withServerFacade(
                serverFormat
            ).create(htmlId);
            childVertexHtmlFacade.setModel(serverFormat);
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
        this.buildGroupRelation = function (groupRelation, parentVertexUi) {
            this.buildGroupRelationToExpandOrNot(
                groupRelation,
                parentVertexUi,
                false
            );
        };
        this.buildGroupRelationToExpand = function (groupRelation, parentVertexUi) {
            this.buildGroupRelationToExpandOrNot(
                groupRelation,
                parentVertexUi,
                true
            );
        };
        this.buildGroupRelationToExpandOrNot = function (groupRelation, parentVertexUi, isToExpand) {
            if (!isToExpand && groupRelation.hasMultipleVertices()) {
                self.buildBubbleHtmlIntoContainer(
                    groupRelation,
                    parentVertexUi,
                    GroupRelationHtmlBuilder
                );
                return;
            }
            $.each(groupRelation.getVertices(), function (key, verticesWithSameUri) {
                $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                    var vertex = vertexAndEdge.vertex,
                        edge = vertexAndEdge.edge;
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
            var verticesContainer = RelativeTreeTemplates[
                "root_vertex_super_container"
                ].merge();
            GraphUi.addHtml(
                verticesContainer
            );
            return verticesContainer;
        }

        function buildChildrenHtmlTreeRecursively(parentBubbleUi) {
            var serverParentVertex = parentBubbleUi.getModel();
            $.each(sortSimilarRelationsByIsGroupRelationOrCreationDate(serverParentVertex.similarRelations), function (key, groupRelation) {
                self.buildGroupRelation(
                    groupRelation,
                    parentBubbleUi
                );
            });
        }

        function buildRootBubble(serverFacade, bubblesContainer) {
            self.rootBubble = _htmlBuilder.withServerFacade(
                serverFacade
            ).create(GraphUi.generateBubbleHtmlId());
            self.rootBubble.setModel(serverFacade);
            self.rootBubble.getHtml().addClass("center-vertex");
            var bubbleContainer = $(
                RelativeTreeTemplates["vertex_container"].merge()
            );
            bubblesContainer.append(bubbleContainer);
            bubbleContainer.append(self.rootBubble.getHtml());
            self.leftChildrenContainer = self.addChildrenContainerToBubble(
                self.rootBubble,
                true
            ).addClass("left-oriented");
            self.rightChildrenContainer = self.addChildrenContainerToBubble(
                self.rootBubble,
                false
            ).addClass("right-oriented");
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
                $.each(sortSimilarRelationsByIsGroupRelationOrCreationDate(serverRootVertex.similarRelations), function (key, groupRelation) {
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
                            if (childHtmlFacade.isVertex() && childHtmlFacade.hasSuggestions() && !childHtmlFacade.hasHiddenRelations()) {
                                api.addSuggestionsToVertex(
                                    childHtmlFacade.getSuggestions(),
                                    childHtmlFacade
                                );
                            }
                        });
                    });
                });
                if (self.rootBubble.hasSuggestions()) {
                    api.addSuggestionsToVertex(
                        self.rootBubble.getModel().getSuggestions(),
                        self.rootBubble
                    );
                }
            }

            function vertexWithId(vertexId) {
                return vertices[vertexId];
            }
        }

        function sortSimilarRelationsByIsGroupRelationOrCreationDate(similarRelations) {
            var sortedKeys = Object.keys(similarRelations).sort(
                function (a, b) {
                    var groupRelationA = similarRelations[a];
                    var groupRelationB = similarRelations[b];
                    if (groupRelationA.hasMultipleVertices() && !groupRelationB.hasMultipleVertices()) {
                        return -1;
                    }
                    if (!groupRelationA.hasMultipleVertices() && groupRelationB.hasMultipleVertices()) {
                        return 1;
                    }
                    var vertexA = groupRelationA.getAnyVertex();
                    var vertexB = groupRelationB.getAnyVertex();
                    if (vertexA.getCreationDate() === vertexB.getCreationDate()) {
                        return 0;
                    }
                    if (vertexA.getCreationDate() > vertexB.getCreationDate()) {
                        return 1;
                    }
                    return -1;
                });
            var sortedSimilarRelations = {};
            $.each(sortedKeys, function () {
                sortedSimilarRelations[this] = similarRelations[this];
            });
            return sortedSimilarRelations;
        }
    };
    return api;

    function flagSuggestionsToNotDisplayGivenParentAndChildVertex(parentVertex, childVertex) {
        if (!parentVertex.getSuggestions) {
            return;
        }
        var hasFlagged = false;
        $.each(parentVertex.getSuggestions(), function () {
            var suggestion = this;
            if (childVertex.getIdentification) {
                if (suggestion.isRelatedToIdentification(childVertex.getIdentification())) {
                    suggestion.shouldNotDisplay();
                    hasFlagged = true;
                }
            } else if (childVertex.hasIdentification) {
                var suggestionAsIdentification = Identification.withUri(
                    suggestion.getSameAs().getUri()
                );
                if (childVertex.hasIdentification(suggestionAsIdentification)) {
                    suggestion.shouldNotDisplay();
                    hasFlagged = true;
                }
            }
        });
        return hasFlagged;
    }
});