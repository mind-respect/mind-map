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
    "triple_brain.graph_element",
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
    "triple_brain.group_relation",
    "triple_brain.graph_element_main_menu",
    "triple_brain.mind_map_info"
], function ($, GraphService, TreeDisplayerCommon, VertexHtmlBuilder, ViewOnlyVertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, IdUri, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly, TreeEdge, Point, VertexController, GroupRelationController, EdgeController, GraphController, GraphElementController, GraphElement, KeyboardActionsHandler, Edge, Identification, GroupRelationHtmlBuilder, GroupRelationUi, SchemaService, SchemaServerFacade, SchemaHtmlBuilder, SchemaUi, SchemaController, PropertyHtmlBuilder, PropertyController, PropertyUi, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SuggestionBubbleUi, SuggestionRelationUi, SuggestionVertexController, SuggestionRelationController, TripleUi, CenterBubble, SelectionHandler, GroupRelation, GraphElementMainMenu, MindMapInfo) {
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
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            serverGraph,
            parentUri
        );
        var parentVertexServerFormat = serverGraph.vertices[parentUri];
        parentVertex.getModel().isLeftOriented = parentVertex.isToTheLeft();
        parentVertex.getModel().groupRelationRoots = parentVertexServerFormat.groupRelationRoots;
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
        parentVertex.hideHiddenRelationsContainer();
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
        GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable(
            GraphElementMainMenu.getExpandAllButton()
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
        if (MindMapInfo.isViewOnly()) {
            return;
        }
        $.each(suggestions, function () {
            api.addSuggestionToVertex(
                this,
                vertex
            );
        });
    };
    api.addSuggestionToVertex = function (suggestion, vertex) {
        if (MindMapInfo.isViewOnly() || !suggestion.shouldDisplay()) {
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
        var treeMaker = new api.TreeMaker(VertexHtmlBuilder);
        var groupRelation = groupRelationUi.getGroupRelation();
        treeMaker.buildGroupRelationToExpand(
            groupRelation,
            groupRelationUi
        );
        $.each(groupRelation.getSortedVertices(), function (key, verticesWithSameUri) {
            $.each(verticesWithSameUri, function (vertexHtmlId) {
                VertexHtmlBuilder.completeBuild(
                    RelativeTreeVertex.withId(vertexHtmlId)
                );
            });
        });
        groupRelationUi.hideHiddenRelationsContainer();
        GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable(
            GraphElementMainMenu.getExpandAllButton()
        );
    };

    api.addNewGroupRelation = function (identifiers, parentBubble, addToLeft) {
        var treeMaker = new api.TreeMaker();
        treeMaker.setDirectionAroundCenter(
            addToLeft
        );
        var newGroupRelation = treeMaker.buildBubbleHtmlIntoContainer(
            GroupRelation.usingIdentification(identifiers),
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
        newVertex.groupRelationRoots = [];
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
            TreeDisplayerCommon.setUiTreeInfoToVertices(serverGraph, parentVertex.getUri());
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
            return this._buildChildrenHtmlTreeRecursively(
                parentVertexHtmlFacade,
                vertices
            );
        };
        this.buildChildrenHtmlTreeRecursively = function (parentVertexHtmlFacade, vertices) {
            this._buildChildrenHtmlTreeRecursively(
                parentVertexHtmlFacade,
                vertices
            );
        };
        this._buildChildrenHtmlTreeRecursively = function (parentBubbleUi) {
            this.buildGroupRelations(
                parentBubbleUi.getModel(),
                parentBubbleUi
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
        this.buildGroupRelationToExpand = function (groupRelation, parentBubbleUi) {
            this.buildGroupRelationToExpandOrNot(
                groupRelation,
                parentBubbleUi,
                true
            );
        };
        this.buildGroupRelations = function (parentModel, parentUi) {
            sortGroupRelationRootsByIsGroupRelationOrCreationDate(parentModel.groupRelationRoots).forEach(function (groupRelation) {
                this.buildGroupRelationToExpandOrNot(
                    groupRelation,
                    parentUi,
                    false
                );
            }.bind(this));
        };
        this.buildGroupRelationToExpandOrNot = function (groupRelation, parentBubbleUi, isToExpand) {
            var self = this;
            if (!isToExpand && groupRelation.hasMultipleVertices()) {
                return self.buildBubbleHtmlIntoContainer(
                    groupRelation,
                    parentBubbleUi,
                    GroupRelationHtmlBuilder
                );
            }
            var relationUi;
            groupRelation.getChildGroupRelations().forEach(function (childGroupRelation) {
                var childGroupRelationUi = this.buildGroupRelationToExpandOrNot(
                    childGroupRelation,
                    parentBubbleUi,
                    false
                );
                if(childGroupRelationUi.isGroupRelation()){
                    GroupRelationHtmlBuilder.completeBuild(
                        childGroupRelationUi
                    );
                }
            }.bind(this));
            $.each(groupRelation.getSortedVertices(), function (key, verticesWithSameUri) {
                $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                    var vertex = vertexAndEdge.vertex,
                        edge = vertexAndEdge.edge;
                    relationUi = self.buildBubbleHtmlIntoContainer(
                        edge,
                        parentBubbleUi,
                        self.edgeBuilder
                    );
                    var childVertexHtmlFacade = self.buildBubbleHtmlIntoContainer(
                        vertex,
                        relationUi,
                        _htmlBuilder,
                        vertexHtmlId
                    );
                    self.edgeBuilder.afterChildBuilt(
                        relationUi,
                        parentBubbleUi,
                        childVertexHtmlFacade
                    );
                    var treeContainer = childVertexHtmlFacade.getHtml().closest(
                        ".vertex-tree-container"
                    );
                    treeContainer[vertex.isLeftOriented ? "prepend" : "append"](
                        self._buildChildrenHtmlTreeRecursively(
                            childVertexHtmlFacade
                        )
                    );
                    if (childVertexHtmlFacade.isVertex() && childVertexHtmlFacade.hasSuggestions() && !childVertexHtmlFacade.hasHiddenRelations()) {
                        api.addSuggestionsToVertex(
                            childVertexHtmlFacade.getSuggestions(),
                            childVertexHtmlFacade
                        );
                    }
                });
            });
            return relationUi;
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
            TreeDisplayerCommon.setUiTreeInfoToVertices(
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
                self.buildGroupRelations(
                    serverRootVertex,
                    self.rootBubble
                );
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

        function sortGroupRelationRootsByIsGroupRelationOrCreationDate(groupRelationRoots) {
            return groupRelationRoots.sort(function (groupRelationA, groupRelationB) {
                    if (groupRelationA.hasMultipleVertices() && !groupRelationB.hasMultipleVertices()) {
                        return -1;
                    }
                    if (!groupRelationA.hasMultipleVertices() && groupRelationB.hasMultipleVertices()) {
                        return 1;
                    }
                    var vertexA = groupRelationA.getAnyVertex();
                    var vertexB = groupRelationB.getAnyVertex();
                    return GraphElement.sortCompare(
                        vertexA,
                        vertexB
                    );
                }
            );
        }
    };
    function compareVertices(vertexA, vertexB) {
        if (vertexA.getCreationDate() === vertexB.getCreationDate()) {
            return 0;
        }
        if (vertexA.getCreationDate() > vertexB.getCreationDate()) {
            return 1;
        }
        return -1;
    }

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
