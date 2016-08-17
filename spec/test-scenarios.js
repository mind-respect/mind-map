/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "text!test/test-scenarios-data.json",
        "triple_brain.vertex",
        "triple_brain.edge",
        'triple_brain.schema',
        "triple_brain.vertex_html_builder",
        "triple_brain.edge_html_builder",
        "triple_brain.group_relation_html_builder",
        "triple_brain.suggestion_bubble_html_builder",
        "triple_brain.suggestion_relation_builder",
        "triple_brain.schema_html_builder",
        "triple_brain.property_html_builder",
        "triple_brain.graph_displayer_as_relative_tree",
        'test/mock',
        'test/test-utils',
        "triple_brain.bubble_factory",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        'triple_brain.graph_displayer_as_tree_common',
        "triple_brain.event_bus",
        "triple_brain.suggestion",
        "triple_brain.identification",
        "triple_brain.friendly_resource",
        "triple_brain.id_uri",
        "triple_brain.language_manager",
        "text!locales/en/translation.json",
        "triple_brain.mind_map_flow",
        "test/vendor/jasmine-jquery"
    ],
    function ($, TestScenarioData, Vertex, Edge, Schema, VertexHtmlBuilder, EdgeHtmlBuilder, GroupRelationHtmlBuilder, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SchemaHtmlBuilder, PropertyHtmlBuilder, GraphDisplayerAsRelativeTree, Mock, TestUtils, BubbleFactory, GraphDisplayer, GraphDisplayerFactory, TreeDisplayerCommon, EventBus, Suggestion, Identification, FriendlyResource, IdUri, LanguageManager, enTranslation, MindMapFlow) {
        "use strict";
        var api = {},
            testData = JSON.parse(TestScenarioData);
        $.i18n.init({
            lng: "en",
            useLocalStorage: false,
            debug: true,
            customLoad: function (lng, ns, options, loadComplete) {
                loadComplete(
                    null,
                    JSON.parse(enTranslation)
                );
            }
        });
        jasmine.getFixtures().fixturesPath = '../spec/fixtures';
        loadFixtures('compare-flow.html');
        api.deepGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("deepGraph");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1");
            };
            this.getCenterVertex = function () {
                var graph = this.getGraph();
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b1")
                        ]
                );
            };
            this.getBubble2 = function () {
                var graph = this.getGraph();
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b2")
                        ]
                );
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.deepGraphWithCircularity = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("deepGraphWithCircularity");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b3");
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            this.getBubble3InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b3");
            };
            this.getBubble4InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b4");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.creationDateScenario = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("creationDate.surroundBubble1Graph");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1");
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble7InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b7");
            };
            this.expandBubble7 = function (bubble7) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble7,
                    getSurroundBubble7Graph()
                );
            };
            function getSurroundBubble7Graph() {
                return api._getTestData(
                    "creationDate.surroundBubble7Graph"
                );
            }
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.mergeBubbleGraph = function () {
            var treeBuilder = new TreeBuilder(this),
                includedElementsTree,
                self = this;
            this.getGraph = function () {
                return api._getTestData("mergeBubbleGraph");
            };
            this.getMergeBubble = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "merge")
                        ]
                );
            };

            this.getBubble1 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b1"
                );
            };

            this.getBubble2 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b2"
                );
            };

            this.getBubble3 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b3"
                );
            };
            this.getBubble4 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b4"
                );
            };

            this.getRelation1 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r1"
                );
            };

            this.getRelation2 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r2"
                );
            };

            this.getRelation4 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r4"
                );
            };

            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "merge");
            };

            this.getMergeBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("merge");
            };
            Mock.setCenterBubbleUriInUrl(this.getMergeBubble().getUri());
            function buildIncludedGraphElementsOfBubble(bubble) {
                return GraphDisplayerAsRelativeTree.buildIncludedGraphElementsView(
                    bubble,
                    $("<div>")
                );
            }

            function getIncludedElementsTree() {
                if (undefined === includedElementsTree) {
                    includedElementsTree = buildIncludedGraphElementsOfBubble(
                        self.getMergeBubbleInTree()
                    );
                }
                return includedElementsTree;
            }
        };

        api.publicPrivate = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("publicPrivate");
            };

            this.getBubble1 = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble2 = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.threeBubblesGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "threeBubblesGraph.getGraph"
                );
            };

            this.reset = function () {
                treeBuilder = new TreeBuilder(this);
            };
            this.expandBubble2 = function (bubble2) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble2,
                    this.getSubGraphForB2()
                );
            };
            this.expandBubble3 = function (bubble3) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble3,
                    this.getSubGraphForB3()
                );
            };
            this.getBubble4InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b4");
            };
            this.getSubGraphForB2 = function() {
                return api._getTestData(
                    "threeBubblesGraph.subGraphForB2"
                );
            };
            this.getSubGraphForB3 = function() {
                return api._getTestData(
                    "threeBubblesGraph.subGraphForB3"
                );
            };

            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1");
            };

            this.getR1Uri = function(){
                return uriOfEdgeWithLabel(this.getGraph(), "r1");
            };
            this.getBubble1 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b1")
                        ]
                );
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            this.getBubble3InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b3");
            };
            this.getRelation1InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "r1"
                );
            };
            this.getBubble1Ui = function () {
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble1()
                ).create();
            };
            this.getBubble2 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b2")
                        ]
                );
            };
            this.getBubble2Ui = function () {
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble2()
                ).create();
            };
            this.getCenterBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getRelation1 = function () {
                return relationWithLabel(this.getGraph(), "r1");
            };
            this.getRelation1Ui = function () {
                var edge = EdgeHtmlBuilder.withServerFacade(
                    this.getRelation1()
                ).create();
                // EdgeHtmlBuilder.afterChildBuilt(
                //     edge,
                //     this.getBubble1Ui(),
                //     this.getBubble2Ui()
                // );
                return edge;
            };
            this.getRelation2 = function () {
                return relationWithLabel(this.getGraph(), "r2");
            };
            Mock.setCenterBubbleUriInUrl(this.getBubble2().getUri());
        };

        api.threeBubblesGraphFork = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "threeBubblesGraph.forkedGraph"
                );
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1");
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.graphWithHiddenSimilarRelations = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.b1Graph"
                );
            };
            this.getCenterBubbleUri = function () {
                return this.getBubble1().getUri();
            };
            this.getB2SurroundGraph = function(){
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.b2Graph"
                );
            };
            this.expandBubble2 = function (bubble2) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble2,
                    this.getB2SurroundGraph()
                );
            };
            this.getB2GraphWhenConnectedToDistantBubble = function () {
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.b2GraphWhenConnectedToDistantBubble"
                );
            };
            this.getDistantBubbleGraphWhenConnectedToBubble1 = function () {
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.distantBubbleGraphWhenConnectedToBubble1"
                );
            };
            this.getDistantBubbleUri = function () {
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.distantBubbleUri"
                );
            };
            this.getBubble1 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b1")
                        ]
                );
            };
            this.getBubble2 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b2")
                        ]
                );
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            Mock.setCenterBubbleUriInUrl(this.getBubble1().getUri());
        };

        api.getDistantGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "graphWithHiddenSimilarRelations.distantBubbleGraph"
                );
            };
            this.getBubble = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "distant bubble")
                        ]
                );
            };
            this.getBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("distant bubble");
            };
            this.getCenterBubbleUri = function () {
                return this.getBubble().getUri();
            };
            Mock.setCenterBubbleUriInUrl(this.getBubble().getUri());
        };

        api.GraphWithAnInverseRelationScenario = function () {
            /*
             * me -going straight->straight bubble
             * me <-going inverse-inverse bubble
             */
            this.getGraph = function () {
                return api._getTestData("graphWithAnInverseRelation");
            };
            this.getCenterVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "me")
                        ]
                );
            };
            var graph = this.getGraph();
        };
        api.GraphWithSimilarRelationsScenario = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("graphWithSimilarRelations");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "me");
            };
            var graph = this.getGraph();
            this.getCenterVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "me")
                        ]
                );
            };
            this.getCenterVertexInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "me"
                );
            };
            this.getPossession = function () {
                return relationIdentificationWithLabel(
                    graph, "Possession"
                );
            };
            this.getPossessionAsGroupRelation = function () {
                var centerVertexUri = this.getCenterVertex().getUri(),
                    possessionExternalUri = this.getPossession().getExternalResourceUri();
                TreeDisplayerCommon.enhancedVerticesInfo(
                    graph,
                    centerVertexUri
                );
                var centerVertex = graph.vertices[centerVertexUri];
                return centerVertex.similarRelations[
                    possessionExternalUri
                    ];
            };
            this.getPossessionAsGroupRelationUi = function () {
                return GroupRelationHtmlBuilder.withServerFacade(
                    this.getPossessionAsGroupRelation()
                ).create();
            };
            this.getPossessionAsGroupRelationInTree = function () {
                return treeBuilder.getRelationWithLabelInTree("Possession");
            };
            this.getBook1 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "book 1")
                        ]
                );
            };
            this.getBook1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "book 1"
                );
            };
            this.getBook2 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "book 2")
                        ]
                );
            };
            this.getRelationWithBook1InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "Possession of book 1"
                );
            };
            this.getRelationWithBook2InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "Possessed by book 2"
                );
            };
            this.getOtherRelation = function () {
                return relationWithLabel(graph, "other relation");
            };
            this.getOtherRelationInTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "other relation"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterVertex().getUri());
        };
        api.relationWithMultipleIdentifiers = function(){
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "relationWithMultipleIdentifiers"
                );
            };
            this.getCenterBubble = function () {
                return treeBuilder.getBubbleWithLabelInTree("Team");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "Team");
            };
            this.getComputerScientistRelation = function () {
                return relationWithLabel(this.getGraph(), "computer scientist");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };
        api.groupRelationWithImage = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("groupRelationWithImage");
            };
            this.getIdeaGroupRelationInTree = function () {
                return treeBuilder.getRelationWithLabelInTree("idea");
            };
            this.getComponentGroupRelationInTree = function () {
                return treeBuilder.getRelationWithLabelInTree("component");
            };
            this.getSomeProject = function () {
                return treeBuilder.getBubbleWithLabelInTree("some project");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "some project");
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };
        api.oneBubbleHavingSuggestionsGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("oneBubbleHavingSuggestionsGraph.original");
            };
            var graph = this.getGraph();
            this.getVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "Event")
                        ]
                );
            };
            this.getVertexUi = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "Event"
                );
            };
            this.getAnySuggestionInTree = function () {
                var eventBubble = this.getVertexUi();
                return eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            };
            this.getOneSuggestion = function () {
                return this.getVertex().getSuggestions()[0];
            };
            this.getAVertexSuggestionUi = function () {
                return SuggestionBubbleHtmlBuilder.withServerFacade(
                    this.getOneSuggestion()
                ).create();
            };
            this.getARelationSuggestionUi = function () {
                return SuggestionRelationBuilder.withServerFacade(
                    this.getOneSuggestion()
                ).create();
            };
            this.getCenterBubbleUri = function () {
                return this.getVertex().getUri();
            };
            Mock.setCenterBubbleUriInUrl(this.getVertex().getUri());
        };
        api.oneBubbleHavingSuggestionsGraphNotCentered = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("oneBubbleHavingSuggestionsGraph.not_centered");
            };
            this.getCenterBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "center"
                );
            };
            this.getEventBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "Event"
                );
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "center"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };
        api.withAcceptedSuggestionGraph = function(){
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "withAcceptedSuggestion.original"
                );
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "Event");
            };
            this.getCenterBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "Event"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };
        api.withAcceptedSuggestionGraphNotCentered = function(){
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "withAcceptedSuggestion.not_centered"
                );
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "center");
            };
            this.getCenterBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "center"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };
        api.getKaraokeSchemaGraph = function () {
            this.getGraph = function () {
                return api._getTestData(
                    "karaokeSchema.schema"
                );
            };
            var graph = this.getGraph();
            this.getSchema = function () {
                return Schema.fromServerFormat(
                    graph
                );
            };
            this.getSchemaAsIdentification = function () {
                return Identification.fromFriendlyResource(
                    this.getSchema()
                );
            };
            this.getProperties = function () {
                return this.getSchema().getProperties();
            };
            this.getSchemaUi = function () {
                return SchemaHtmlBuilder.withServerFacade(
                    this.getSchema()
                ).create();
            };
            this.getInviteesPropertyUi = function () {
                return PropertyHtmlBuilder.withServerFacade(
                    this.getInviteesProperty()
                ).create();
            };
            this.getLocationProperty = function () {
                return schemaPropertyWithLabel(
                    this.getSchema(),
                    "location"
                );
            };
            this.getLocationPropertyAsSuggestion = function () {
                return Suggestion.fromSchemaPropertyAndOriginUri(
                    this.getLocationProperty(),
                    this.getSchema().getUri()
                );
            };
            this.getInviteesPropertyAsSuggestion = function () {
                return Suggestion.fromSchemaPropertyAndOriginUri(
                    this.getInviteesProperty(),
                    this.getSchema().getUri()
                );
            };
            this.getInviteesProperty = function () {
                return schemaPropertyWithLabel(
                    this.getSchema(),
                    "invitees"
                );
            };
            Mock.setCenterBubbleUriInUrl(
                this.getSchema().getUri()
            );
        };

        api.karaokeSchemaSearchResults = function () {
            this.get = function () {
                return api._getTestData(
                    "karaokeSchema.searchResults"
                );
            };
        };

        api.getWikidataSearchResultForProject = function () {
            this.get = function () {
                return api._getTestData(
                    "wikidataSearchResultForProject"
                );
            };
        };

        api.getProjectSchema = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "projectSchema.schema"
                );
            };
            var graph = this.getGraph();
            this.getCenterBubbleUri = function () {
                return Schema.fromServerFormat(
                    graph
                ).getUri();
            };
            this.getSchemaInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("project");
            };
        };

        api.getSearchResultsForProject = function () {
            this.get = function () {
                return api._getTestData(
                    "projectSchema.searchResultsForProject"
                );
            };
        };

        api.getSearchResultsForProjectAfterIdentificationAdded = function () {
            this.get = function () {
                return api._getTestData(
                    "projectSchema.searchResultsForProjectAfterIdentificationAdded"
                );
            };
        };

        api.withRelationsAsIdentifierSearchSome = function(){
            this.get = function () {
                return api._getTestData("relationsAsIdentifier.searchSome");
            };
        };

        api.withRelationsAsIdentifierGraph = function(){
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("relationsAsIdentifier.graph");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "center"
                );
            };
            this.getCenterInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("center");
            };
            Mock.setCenterBubbleUriInUrl(
                this.getCenterBubbleUri()
            );
        };

        api.graphWithARelationInTwoSimilarRelationsGroup = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData("projectSchema.someProjectGraph");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "some project"
                );
            };
            this.getSomeProjectInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("some project");
            };
            this.getImpact3RelationInTheImpactOnTheIndividualContext = function () {
                var theRelation;
                this.getSomeProjectInTree().visitAllChild(function (childBubble) {
                    if (childBubble.isRelation()) {
                        theRelation = childBubble;
                    }
                });
                return theRelation;
            };
            this.getImpact3RelationInTheImpactOnSocietyContext = function () {
                var theRelation;
                this.getSomeProjectInTree().visitAllChild(function (childBubble) {
                    if (childBubble.isGroupRelation()) {
                        GraphDisplayerAsRelativeTree.expandGroupRelation(childBubble);
                        var treeQuerier = new api.TreeQuerier(childBubble.getChildrenContainer());
                        theRelation = treeQuerier.getRelationWithLabelInTree("impact 3");
                    }
                });
                return theRelation;
            };
            Mock.setCenterBubbleUriInUrl(
                this.getCenterBubbleUri()
            );
        };

        api.getSchemaProjectDetailsSearchResult = function () {
            this.get = function () {
                return api._getTestData(
                    "projectSchema.projectSearchDetails"
                );
            };
        };

        api.impactOnSocietyPropertySearchDetails = function () {
            this.get = function () {
                return api._getTestData(
                    "projectSchema.impactOnSocietySearchDetails"
                );
            };
        };

        api.getSearchResultsForImpact = function () {
            this.get = function () {
                return api._getTestData(
                    "projectSchema.searchResultsForImpact"
                );
            };
        };
        api.getSearchResultForB1 = function () {
            this.get = function () {
                return api._getTestData(
                    "threeBubblesGraph.searchResultsForB1"
                );
            };
        };
        api.getSearchResultForR2 = function () {
            this.get = function () {
                return api._getTestData(
                    "threeBubblesGraph.searchResultsForR2"
                );
            };
        };
        api.graphWithCircularityScenario = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "graphWithCircularity.b1Graph"
                );
            };
            this.expandBubble2 = function (bubble2) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble2,
                    api._getTestData(
                        "graphWithCircularity.b2Graph"
                    )
                );
            };
            this.expandBubble3 = function (bubble3) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble3,
                    api._getTestData(
                        "graphWithCircularity.b3Graph"
                    )
                );
            };
            this.getBubble1Duplicate = function () {
                var bubble2 = this.getBubble2InTree();
                this.expandBubble2(bubble2);
                var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
                this.expandBubble3(bubble3);
                return bubble3.getTopMostChildBubble().getTopMostChildBubble();
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "b1"
                );
            };
            this.getBubble1InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "b1"
                );
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "b2"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        api.centerWith2RelationsToSameChildScenario = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return api._getTestData(
                    "bubbleWith2RelationsToSameBubble"
                );
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "center"
                );
            };
            this.getCenterInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree(
                    "center"
                );
            };
            Mock.setCenterBubbleUriInUrl(this.getCenterBubbleUri());
        };

        GraphDisplayer.setImplementation(
            GraphDisplayerFactory.getByName(
                "relative_tree"
            )
        );
        api.TreeQuerier = function (tree) {
            this.getBubbleWithLabelInTree = function (label) {
                return BubbleFactory.fromHtml(
                    tree.find(".bubble").has(".bubble-label:contains(" + label + ")")
                );
            };
            this.getRelationWithLabelInTree = function (label) {
                return BubbleFactory.fromHtml(
                    tree.find(".relation").has(".label:contains(" + label + ")")
                );
            };
            this.getGroupRelationWithLabelInTree = function (label) {
                return BubbleFactory.fromHtml(
                    tree.find(".group-relation").has(".label:contains(" + label + ")")
                );
            };
        };
        api._getTestData = function (key) {
            var splitKey = key.split(/\./),
                data = testData;
            while (splitKey.length && data) {
                data = data[splitKey.shift()];
            }
            var deep = true;
            if (data.constructor === Array) {
                return data.slice();
            }
            if(typeof data === 'object'){
                return $.extend(deep, {}, data);
            }
            return data;
        };
        return api;
        function uriOfVertexWithLabel(graph, label) {
            var uri;
            $.each(graph.vertices, function (key, value) {
                var vertex = Vertex.fromServerFormat(value);
                if (vertex.getLabel() === label) {
                    uri = vertex.getUri();
                    return -1;
                }
            });
            return uri;
        }
        function uriOfEdgeWithLabel(graph, label) {
            var uri;
            $.each(graph.edges, function (key, value) {
                var edge = Edge.fromServerFormat(value);
                if (edge.getLabel() === label) {
                    uri = edge.getUri();
                    return -1;
                }
            });
            return uri;
        }

        function schemaPropertyWithLabel(schema, label) {
            var foundProperty;
            $.each(schema.getProperties(), function (key, property) {
                if (property.getLabel() === label) {
                    foundProperty = property;
                    return -1;
                }
            });
            return foundProperty;
        }

        function relationWithLabel(graph, label) {
            var foundRelation;
            $.each(graph.edges, function (key, value) {
                var relation = Edge.fromServerFormat(value);
                if (relation.getLabel() === label) {
                    foundRelation = relation;
                    return -1;
                }
            });
            return foundRelation;
        }

        function relationIdentificationWithLabel(graph, label) {
            var foundIdentification;
            $.each(graph.edges, function (key, value) {
                var edge = Edge.fromServerFormat(value);
                $.each(edge.getIdentifications(), function () {
                    var identification = this;
                    if (identification.getLabel() === label) {
                        foundIdentification = identification;
                        return -1;
                    }
                });
                if (foundIdentification !== undefined) {
                    return -1;
                }
            });
            return foundIdentification;
        }

        function makeTree(graph, centerBubbleUri) {
            GraphDisplayer.reset();
            var treeMaker = new GraphDisplayerAsRelativeTree.TreeMaker();
            var tree = IdUri.isSchemaUri(centerBubbleUri) ?
                treeMaker.makeForSchema(
                    Schema.fromServerFormat(graph)
                ) :
                treeMaker.makeForCenterVertex(
                    graph,
                    centerBubbleUri
                );
            GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                if(vertex.getUri() === centerBubbleUri){
                    vertex.setAsCentral();
                }
                EventBus.publish(
                    '/event/ui/vertex/visit_after_graph_drawn',
                    vertex
                );
            });
            GraphDisplayer.getGroupRelationSelector().visitAllGroupRelations(function (groupRelationUi) {
                    EventBus.publish(
                        '/event/ui/group_relation/visit_after_graph_drawn',
                        groupRelationUi
                    );
                }
            );
            return tree;
        }

        function TreeBuilder(context) {
            this.build = function () {
                if (this._tree === undefined) {
                    this._tree = makeTree(
                        context.getGraph(),
                        context.getCenterBubbleUri()
                    );
                }
                return this._tree;
            };
            this.getBubbleWithLabelInTree = function (label) {
                return new api.TreeQuerier(
                    this.build()
                ).getBubbleWithLabelInTree(label);
            };
            this.getRelationWithLabelInTree = function (label) {
                return new api.TreeQuerier(
                    this.build()
                ).getRelationWithLabelInTree(label);
            };
        }
    }
);

