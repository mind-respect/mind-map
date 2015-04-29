/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "text!test/resources/test-scenarios-data.json",
        'triple_brain.vertex',
        'triple_brain.edge',
        'triple_brain.schema',
        "triple_brain.vertex_html_builder",
        "triple_brain.edge_html_builder",
        "triple_brain.group_relation_html_builder",
        "triple_brain.suggestion_bubble_html_builder",
        "triple_brain.suggestion_relation_builder",
        "triple_brain.schema_html_builder",
        "triple_brain.property_html_builder",
        "triple_brain.graph_displayer_as_relative_tree",
        'test/webapp/js/mock',
        'test/webapp/js/test-utils',
        "triple_brain.bubble_factory",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        'triple_brain.graph_displayer_as_tree_common',
        "triple_brain.vertex_server_format_builder",
        "triple_brain.event_bus",
        "triple_brain.suggestion",
        "triple_brain.identification",
        "triple_brain.friendly_resource",
        "triple_brain.language_manager",
        "text!main/webapp/locales/en/translation.json"
    ],
    function (TestScenarioData, Vertex, Edge, Schema, VertexHtmlBuilder, EdgeHtmlBuilder, GroupRelationHtmlBuilder, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SchemaHtmlBuilder, PropertyHtmlBuilder, GraphDisplayerAsRelativeTree, Mock, TestUtils, BubbleFactory, GraphDisplayer, GraphDisplayerFactory, TreeDisplayerCommon, VertexServerFormatBuilder, EventBus, Suggestion, Identification, FriendlyResource, LanguageManager, enTranslation) {
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
        api.addTriple = function (bubble) {
            var destinationVertex = generateVertex(),
                edge = generateEdge(
                    bubble.getUri,
                    destinationVertex.getUri()
                );
            return GraphDisplayer.addEdgeAndVertex(
                bubble,
                edge,
                destinationVertex
            );
        };

        api.deepGraph = function () {
            this.getGraph = function () {
                /*
                 b1-r1->b2
                 b2-r2->b3
                 b2<-r3-b4
                 b1<-r4-b5
                 */
                return getTestData("deepGraph");
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
        };

        api.deepGraphWithCircularity = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData("deepGraphWithCircularity");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b3")
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
        };

        api.mergeBubbleGraph = function () {
            /*
             one bubble labeled merge
             merge contains bubbles
             b1-r1->b2
             b2-r2->b3
             b1<-r4-b4
             */
            var treeBuilder = new TreeBuilder(this),
                includedElementsTree,
                self = this;
            this.getGraph = function () {
                return getTestData("mergeBubbleGraph");
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
                )
            };

            this.getBubble2 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b2"
                )
            };

            this.getBubble3 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b3"
                )
            };
            this.getBubble4 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b4"
                )
            };

            this.getRelation1 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r1"
                )
            };

            this.getRelation2 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r2"
                )
            };

            this.getRelation4 = function () {
                return new api.TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r4"
                )
            };

            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "merge")
            };

            this.getMergeBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("merge");
            };
            Mock.setCenterVertexUriInUrl(this.getMergeBubble().getUri());
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

        api.threeBubblesGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData(
                    "threeBubblesGraph.getGraph"
                );
            };

            this.reset = function () {
                treeBuilder = new TreeBuilder(this);
            };
            this.expandBubble3 = function (bubble3) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble3,
                    getSurroundBubble3Graph()
                );
            };
            this.getBubble4InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b4");
            };
            function getSurroundBubble3Graph() {
                /*
                 b3<-r2-b1
                 b3-r3>-b4
                 b3-r4->b5
                 b4 has hidden relations
                 */
                return getTestData(
                    "threeBubblesGraph.getSurroundBubble3Graph"
                );
            }

            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1")
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
                EdgeHtmlBuilder.afterChildBuilt(
                    edge,
                    this.getBubble1Ui(),
                    this.getBubble2Ui()
                );
                return edge;
            };
            this.getRelation2 = function () {
                return relationWithLabel(this.getGraph(), "r2");
            };
            Mock.setCenterVertexUriInUrl(this.getBubble2().getUri());
        };

        api.getGraphWithHiddenSimilarRelations = function () {
            /*
             * b1-r1->b2
             * b2 has hidden relations
             * b2-T-shirt->shirt1
             * b2-T-shirt->shirt2
             * shirt2 has an image
             * relations T-shirt are identified to Freebase T-shirt.
             */
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData(
                    "graphWithHiddenSimilarRelations.b1Graph"
                );
            };
            this.getCenterBubbleUri = function () {
                return this.getBubble1().getUri();
            };
            this.expandBubble2 = function (bubble2) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble2,
                    getTestData(
                        "graphWithHiddenSimilarRelations.b2Graph"
                    )
                );
            };
            this.getB2GraphWhenConnectedToDistantBubble = function () {
                return getTestData(
                    "graphWithHiddenSimilarRelations.b2GraphWhenConnectedToDistantBubble"
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
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            Mock.setCenterVertexUriInUrl(this.getBubble1().getUri());
        };

        api.getDistantGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData(
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
            Mock.setCenterVertexUriInUrl(this.getBubble().getUri());
        };

        api.GraphWithAnInverseRelationScenario = function () {
            /*
             * me -going straight->straight bubble
             * me <-going inverse-inverse bubble
             */
            this.getGraph = function () {
                return getTestData("graphWithAnInverseRelation");
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
            /*
             me-Possession of book 1->book 1
             me<-Possessed by book 2-book 2
             me-Possession of book 3->book 3
             me-other relation->other bubble
             me-original relation->b1
             me-same as original relation->b2
             */
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData("graphWithSimilarRelations");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "me")
            };
            var graph = this.getGraph();
            this.getCenterVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "me")
                        ]
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
            Mock.setCenterVertexUriInUrl(this.getCenterVertex().getUri());
        };
        api.oneBubbleHavingSuggestionsGraph = function () {
            /*
             * Bubble labeled Event.
             * Has a generic identification to freebase "Event" http://rdf.freebase.com/rdf/m/02xm94t
             * Has 2 suggestions
             */
            var treeBuilder = new TreeBuilder(this),
                hasShownSuggestions = false;
            this.getGraph = function () {
                return getTestData("oneBubbleHavingSuggestionsGraph");
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
            Mock.setCenterVertexUriInUrl(this.getVertex().getUri());
        };
        api.getKaraokeSchemaGraph = function () {
            /*
             karaoke->invitees
             karaoke->repertoire
             karaoke->location
             location identified to Freebase Location
             */
            this.getGraph = function () {
                return getTestData("karaokeSchemaGraph");
            };
            var graph = this.getGraph();
            this.getSchema = function () {
                return Schema.fromServerFormat(
                    graph
                );
            };
            this.getSchemaAsIdentification = function () {
                return Identification.fromFriendlyResource(
                    FriendlyResource.withUri(
                        this.getSchema().getUri()
                    )
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
            Mock.setCenterVertexUriInUrl(
                this.getSchema().getUri()
            );
        };

        api.getFreebaseSearchResultForProject = function () {
            this.get = function () {
                return getTestData(
                    "freebaseSearchResultForProject"
                );
            };
        };

        api.getSearchResultsForProject = function () {
            /*
             * schema project
             * project -> impact on the individual
             * project -> impact on society
             * project -> has objective
             * project -> has component
             */
            this.get = function () {
                return getTestData(
                    "projectSchema.searchResultsForProject"
                );
            };
        };

        api.graphWithARelationInTwoSimilarRelationsGroup = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData("projectSchema.someProjectGraph");
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(
                    this.getGraph(),
                    "some project"
                )
            };
            this.getSomeProjectInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("some project");
            };
            this.getImpact3RelationInTheImpactOnTheIndividualContext = function(){
                var theRelation;
                this.getSomeProjectInTree().visitAllChild(function(childBubble){
                    if(childBubble.isRelation()){
                        theRelation = childBubble;
                    }
                });
                return theRelation;
            };
            this.getImpact3RelationInTheImpactOnSocietyContext = function(){
                var theRelation;
                this.getSomeProjectInTree().visitAllChild(function(childBubble){
                    if(childBubble.isGroupRelation()){
                        GraphDisplayerAsRelativeTree.expandGroupRelation(childBubble);
                        var treeQuerier = new api.TreeQuerier(childBubble.getChildrenContainer());
                        theRelation = treeQuerier.getRelationWithLabelInTree("impact 3");
                    }
                });
                return theRelation;
            };
            Mock.setCenterVertexUriInUrl(
                this.getCenterBubbleUri()
            );
        };

        api.getSchemaProjectDetailsSearchResult = function () {
            this.get = function () {
                return getTestData(
                    "projectSchema.projectSearchDetails"
                );
            };
        };

        api.impactOnSocietyPropertySearchDetails = function () {
            this.get = function () {
                return getTestData(
                    "projectSchema.impactOnSocietySearchDetails"
                );
            };
        };

        api.getSearchResultsForImpact = function () {
            this.get = function () {
                return getTestData(
                    "projectSchema.searchResultsForImpact"
                );
            };
        };
        api.getSearchResultForB1 = function () {
            this.get = function () {
                return getTestData(
                    "threeBubblesGraph.searchResultsForB1"
                );
            };
        };
        api.getSearchResultForR2 = function () {
            this.get = function () {
                return getTestData(
                    "threeBubblesGraph.searchResultsForR2"
                );
            };
        };
        api.graphWithCircularityScenario = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                return getTestData(
                    "graphWithCircularity.b1Graph"
                );
            };
            this.expandBubble2 = function (bubble2) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble2,
                    getTestData(
                        "graphWithCircularity.b2Graph"
                    )
                );
            };
            this.expandBubble3 = function (bubble3) {
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble3,
                    getTestData(
                        "graphWithCircularity.b3Graph"
                    )
                );
            };
            this.getBubble1Duplicate = function(){
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
                )
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

        function makeTree(graph, centralVertexUri) {
            GraphDisplayer.reset();
            var tree = new GraphDisplayerAsRelativeTree.TreeMaker()
                .makeForCenterVertex(
                graph,
                centralVertexUri
            );

            GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
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

        function generateVertex() {
            return Vertex.fromServerFormat(
                VertexServerFormatBuilder.buildWithUri(
                    TestUtils.generateVertexUri()
                )
            );
        }

        function generateEdge(sourceVertexUri, destinationVertexUri) {
            return Edge.fromServerFormat(
                Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                    TestUtils.generateEdgeUri(),
                    sourceVertexUri,
                    destinationVertexUri
                )
            );
        }

        function getTestData(key) {
            var splitKey = key.split(/\./),
                data = testData;
            while (splitKey.length && data) {
                data = data[splitKey.shift()];
            }
            var deep = true;
            if(data.constructor === Array){
                return data.slice();
            }
            return $.extend(deep, {}, data)
        }
    }
);

