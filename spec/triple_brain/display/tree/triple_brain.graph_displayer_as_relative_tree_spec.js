/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.center_bubble",
    "triple_brain.vertex_html_builder",
    "triple_brain.edge_html_builder",
    "triple_brain.graph_element",
    "triple_brain.sub_graph",
    "triple_brain.graph_service"
], function (Scenarios, TestUtils, Mock, GraphServiceMock, GraphDisplayerAsRelativeTree, CenterBubble, VertexHtmlBuilder, EdgeHtmlBuilder, GraphElement, SubGraph, GraphService) {
    "use strict";
    describe("graph_displayer_as_relative_tree_spec", function () {
        it("distributes triples evenly to the right and left", function () {
            var centerBubble = CenterBubble.usingBubble(
                new Scenarios.threeBubblesGraph().getCenterBubbleInTree()
            );
            expect(
                centerBubble._getNumberOfImmediateBubblesToLeft()
            ).toBe(1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToRight()
            ).toBe(1);
        });

        it("distributes new triples evenly to the right and left", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
            var firstAddedEdge = TestUtils.addTriple(bubble1).edge(),
                secondAddedEdge = TestUtils.addTriple(bubble1).edge();
            expect(
                firstAddedEdge.isToTheLeft()
            ).toBeFalsy();
            expect(
                secondAddedEdge.isToTheLeft()
            ).toBeTruthy();
        });

        it("appends to group relation when expanding", function () {
            var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            expect(
                groupRelation.hasChildren()
            ).toBeFalsy();
            GraphDisplayerAsRelativeTree.expandGroupRelation(
                groupRelation
            );
            expect(
                groupRelation.hasChildren()
            ).toBeTruthy();
        });

        it("groups similar relations when they come out of an expanded bubble", function () {
            var graphWithHiddenSimilarRelationsScenario = new Scenarios.getGraphWithHiddenSimilarRelations();
            var bubble2 = graphWithHiddenSimilarRelationsScenario.getBubble2InTree();
            expect(
                bubble2.hasHiddenRelationsContainer()
            ).toBeTruthy();
            graphWithHiddenSimilarRelationsScenario.expandBubble2(
                bubble2
            );
            expect(
                bubble2.hasHiddenRelationsContainer()
            ).toBeFalsy();
            expect(
                bubble2.getTopMostChildBubble().isGroupRelation()
            ).toBeTruthy();
        });

        it("preserves direction with parent vertex for expanded group relations", function () {
            var graphWithSimilarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = graphWithSimilarRelationsScenario.getPossessionAsGroupRelationInTree();
            GraphDisplayerAsRelativeTree.expandGroupRelation(
                groupRelation
            );
            expect(
                graphWithSimilarRelationsScenario.getRelationWithBook1InTree().isInverse()
            ).toBeFalsy();
            expect(
                graphWithSimilarRelationsScenario.getRelationWithBook2InTree().isInverse()
            ).toBeTruthy();
        });
        it("removes hidden properties indicator when expanding group relation", function () {
            var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            expect(
                groupRelation.hasHiddenRelationsContainer()
            ).toBeTruthy();
            GraphDisplayerAsRelativeTree.expandGroupRelation(
                groupRelation
            );
            expect(
                groupRelation.hasHiddenRelationsContainer()
            ).toBeFalsy();
        });
        it("contains all connected elements for included graph elements view", function () {
            var mergeBubbleScenario = new Scenarios.mergeBubbleGraph();
            expect(
                mergeBubbleScenario.getBubble1()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getRelation1()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getBubble2()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getBubble4()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getRelation4()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getRelation2()
            ).toBeDefined();
            expect(
                mergeBubbleScenario.getBubble3()
            ).toBeDefined();
        });
        it("can show a bubble suggestions", function () {
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            var locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            bubble2.getModel().setSuggestions(
                [
                    locationSuggestion
                ]
            );
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                bubble2.getModel().getSuggestions(),
                bubble2
            );
            var relationSuggestion = bubble2.getTopMostChildBubble(),
                vertexSuggestion = relationSuggestion.getTopMostChildBubble();
            expect(
                relationSuggestion.text()
            ).toBe("location");
            expect(
                vertexSuggestion.getIdentifications()[0].getLabel()
            ).toBe("Location");
        });
        it("does not show already accepted suggestions", function () {
            var centerBubble = new Scenarios.withAcceptedSuggestionGraph().getCenterBubbleInTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "start date"
                )
            ).toBeTruthy();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "venue"
                )
            ).toBeTruthy();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "Person"
                )
            ).toBeTruthy();
        });
        it("can make a vertex connect to a distant vertex", function () {
            connectDistantVertexTest(function (distantBubble) {
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    connectedBubble.text()
                ).toBe("b2");
            });
        });

        it("groups similar relations when connecting to a distant vertex, ", function () {
            connectDistantVertexTest(function (distantBubble) {
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                var tShirtBubble = new Scenarios.TreeQuerier(
                    connectedBubble.getChildrenContainer()
                ).getGroupRelationWithLabelInTree("T-shirt");
                expect(
                    tShirtBubble.isGroupRelation()
                ).toBeTruthy();
            });
        });
        it("shows child bubbles images of a distant vertex when connecting to a distant vertex", function () {
            connectDistantVertexTest(function (distantBubble) {
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    connectedBubble.hasImagesMenu()
                ).toBeTruthy();
            });
        });
        it("selects new relation when connecting to a distant vertex", function () {
            connectDistantVertexTest(function (distantBubble) {
                var newRelation = distantBubble.getTopMostChildBubble();
                expect(
                    newRelation.isRelation()
                ).toBeTruthy();
                expect(
                    newRelation.isSelected()
                ).toBeTruthy();
            });
        });

        it("does not duplicate the hidden relation image of a child bubble when creating a distant relationship", function () {
            var graphWithHiddenSimilarRelationsScenario = new Scenarios.getGraphWithHiddenSimilarRelations();
            var bubble1 = graphWithHiddenSimilarRelationsScenario.getBubble1InTree();
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1, "r1"
            ).getTopMostChildBubble();
            expect(
                getNumberOfHiddenPropertiesContainer(
                    bubble2
                )
            ).toBe(1);
            connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(
                bubble1,
                graphWithHiddenSimilarRelationsScenario.getDistantBubbleUri(),
                graphWithHiddenSimilarRelationsScenario.getDistantBubbleGraphWhenConnectedToBubble1(),
                function (bubble1) {
                    bubble2 = TestUtils.getChildWithLabel(
                        bubble1, "r1"
                    ).getTopMostChildBubble();
                    expect(
                        getNumberOfHiddenPropertiesContainer(
                            bubble2
                        )
                    ).toBe(1);
                }
            );
        });

        it("contains all elements for deep circular graph", function () {
            var deepGraphWithCircularity = new Scenarios.deepGraphWithCircularity();
            expect(
                deepGraphWithCircularity.getBubble3InTree()
            ).toBeDefined();
            expect(
                deepGraphWithCircularity.getBubble2InTree()
            ).toBeDefined();
            expect(
                deepGraphWithCircularity.getBubble4InTree()
            ).toBeDefined();
            expect(
                deepGraphWithCircularity.getBubble1InTree()
            ).toBeDefined();
        });
        it("can have duplicate relations", function () {
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
                impact3InIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
                impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();
            expect(
                impact3InIndividualContext.getUri()
            ).toBe(
                impact3InSocietyContext.getUri()
            );
            expect(
                impact3InIndividualContext.getId()
            ).not.toBe(
                impact3InSocietyContext.getId()
            );
        });
        it("completes build of new graph elements when adding new edge and vertex", function () {
            var parent = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var destinationVertex = TestUtils.generateVertex();
            var edge = TestUtils.generateEdge(
                parent.getUri(),
                destinationVertex.getUri()
            );
            var spyOnVertexCompleteBuild = spyOn(VertexHtmlBuilder, "completeBuild");
            var spyOnEdgeCompleteBuild = spyOn(EdgeHtmlBuilder, "afterChildBuilt");
            GraphDisplayerAsRelativeTree.addEdgeAndVertex(
                parent,
                edge,
                destinationVertex
            );
            expect(
                spyOnEdgeCompleteBuild.calls.count()
            ).toBe(1);
            expect(
                spyOnVertexCompleteBuild.calls.count()
            ).toBe(1);
        });
        it("completes the build of a property after adding one", function () {
            var schema = new Scenarios.getProjectSchema().getSchemaInTree();
            var propertyUi = GraphDisplayerAsRelativeTree.addProperty(
                GraphElement.withUri(
                    TestUtils.generateVertexUri()
                ),
                schema
            );
            expect(
                propertyUi.getIdentifications().length
            ).toBe(0);
        });

        it("displays suggestions by default", function () {
            var centerBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            expect(
                centerBubble.getNumberOfChild() > 0
            ).toBeTruthy();
        });

        it("also displays suggestions by default for children", function () {
            var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraphNotCentered().getEventBubbleInTree();
            expect(
                eventBubble.getNumberOfChild() > 0
            ).toBeTruthy();
        });

        it("does not display child suggestions if child has hidden relations", function () {
            var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
            var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(eventBubble.hasHiddenRelations());
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(0);
            expect(
                eventBubble.hasHiddenRelationsContainer()
            ).toBeTruthy();
        });

        it("displays child suggestions after expanding child tree", function () {
            var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
            var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                eventBubble.hasHiddenRelationsContainer()
            ).toBeTruthy();
            GraphServiceMock.getForCentralVertexUriMock(
                new Scenarios.withAcceptedSuggestionGraph().getGraph()
            );
            eventBubble.addChildTree();
            expect(
                TestUtils.hasChildWithLabel(
                    eventBubble,
                    "venue"
                )
            ).toBeTruthy();
            var venueBubble = TestUtils.getChildWithLabel(
                eventBubble,
                "venue"
            );
            expect(
                venueBubble.isRelationSuggestion()
            ).toBeTruthy();
        });

        it("does not display already accepted suggestions after expanding child tree", function () {
            var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
            var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                eventBubble.hasHiddenRelationsContainer()
            ).toBeTruthy();
            GraphServiceMock.getForCentralVertexUriMock(
                new Scenarios.withAcceptedSuggestionGraph().getGraph()
            );
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(0);
            eventBubble.addChildTree();
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(3);
        });

        it("sorts center bubble children in order of creation date", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b1 = scenario.getBubble1InTree();
            var centerBubble = CenterBubble.usingBubble(b1);
            var toTheRightVertex = centerBubble.getToTheRightTopMostChild().getTopMostChildBubble();
            expect(
                toTheRightVertex.text()
            ).toBe("b2");
            var toTheLeftVertex = centerBubble.getToTheLeftTopMostChild().getTopMostChildBubble();
            expect(
                toTheLeftVertex.text()
            ).toBe("b3");
            toTheRightVertex = toTheRightVertex.getBubbleUnder();
            expect(
                toTheRightVertex.text()
            ).toBe("b4");
            toTheLeftVertex = toTheLeftVertex.getBubbleUnder();
            expect(
                toTheLeftVertex.text()
            ).toBe("b5");
            toTheRightVertex = toTheRightVertex.getBubbleUnder();
            expect(
                toTheRightVertex.text()
            ).toBe("b6");
            toTheLeftVertex = toTheLeftVertex.getBubbleUnder();
            expect(
                toTheLeftVertex.text()
            ).toBe("b7");
        });

        it("sorts non center bubble children in order of creation date", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b1 = scenario.getBubble1InTree();
            var b7 = TestUtils.getChildWithLabel(
                b1,
                "r6"
            ).getTopMostChildBubble();
            scenario.expandBubble7(
                b7
            );
            var childVertex = b7.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                childVertex.text()
            ).toBe("b71");
            childVertex = childVertex.getBubbleUnder();
            expect(
                childVertex.text()
            ).toBe("b72");
            childVertex = childVertex.getBubbleUnder();
            expect(
                childVertex.text()
            ).toBe("b73");
            childVertex = childVertex.getBubbleUnder();
            expect(
                childVertex.text()
            ).toBe("b74");
        });

        it("sorts bubble children so that group relations are at the top", function () {
            var me = new Scenarios.GraphWithSimilarRelationsScenario().getCenterVertexInTree();
            var centerBubble = CenterBubble.usingBubble(me);
            var toTheRightBubble = centerBubble.getToTheRightTopMostChild();
            expect(
                toTheRightBubble.isGroupRelation()
            ).toBeTruthy();
            var toTheLeftBubble = centerBubble.getToTheLeftTopMostChild();
            expect(
                toTheLeftBubble.isGroupRelation()
            ).toBeTruthy();
        });

        it("setups to the left html correctly when adding new suggestion to vertex", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var relation = CenterBubble.usingBubble(
                b1Fork
            ).getToTheLeftTopMostChild();
            expect(
                relation.isRelation()
            ).toBeTruthy();
            expect(
                relation.isToTheLeft()
            ).toBeTruthy();
            var relationText = relation.text();
            relation.remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var bubbleToTheLeft = TestUtils.getChildWithLabel(
                b1Fork,
                relationText
            ).getTopMostChildBubble();
            expect(
                bubbleToTheLeft.isToTheLeft()
            ).toBeTruthy();
            expect(
                bubbleToTheLeft.getHtml().closest(".vertex-container").next(
                    ".vertical-border"
                ).length
            ).toBeGreaterThan(0);
        });

        it("setups to the left html correctly for vertex suggestions", function () {
            var centerVertex = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            var suggestionVertex = TestUtils.getChildWithLabel(
                centerVertex,
                "Person"
            ).getTopMostChildBubble();
            expect(
                suggestionVertex.isToTheLeft()
            ).toBeTruthy();
            expect(
                suggestionVertex.getHtml().closest(".vertex-container").next(
                    ".vertical-border"
                ).length
            ).toBeGreaterThan(0);
        });
        
        function connectDistantVertexTest(callback) {
            var distantGraphScenario = new Scenarios.getDistantGraph();
            var graphWithHiddenSimilarRelationsScenario = new Scenarios.getGraphWithHiddenSimilarRelations();
            connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(
                distantGraphScenario.getBubbleInTree(),
                graphWithHiddenSimilarRelationsScenario.getBubble2().getUri(),
                graphWithHiddenSimilarRelationsScenario.getB2GraphWhenConnectedToDistantBubble(),
                callback
            );
        }

        function connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(currentBubble, distantBubbleUri, graphOfDistantBubble, callback) {
            Mock.setGetGraphFromService(
                graphOfDistantBubble
            );
            var hasVisitedCallback = false;
            GraphDisplayerAsRelativeTree.connectVertexToVertexWithUri(
                currentBubble,
                distantBubbleUri,
                function () {
                    hasVisitedCallback = true;
                    callback(currentBubble);
                }
            );
            expect(
                hasVisitedCallback
            ).toBeTruthy();
        }

        function getNumberOfHiddenPropertiesContainer(bubble) {
            return bubble.getHtml().find(
                ".hidden-properties-container"
            ).length;
        }
    });
});