/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.center_bubble",
    'test/webapp/js/test-scenarios',
    'test/webapp/js/mock'
], function (GraphDisplayerAsRelativeTree, CenterBubble, Scenarios, Mock) {
    "use strict";
    describe("graph_displayer_as_relative_tree_spec", function () {
        var threeBubblesGraph,
            bubble1,
            bubble2,
            graphWithHiddenSimilarRelationsScenario,
            groupRelation,
            graphWithSimilarRelationsScenario,
            mergeBubbleScenario,
            karaokeSchemaScenario,
            distantGraphScenario;
        beforeEach(function () {
            threeBubblesGraph = new Scenarios.threeBubblesGraph();
            distantGraphScenario = new Scenarios.getDistantGraph();
            bubble1 = threeBubblesGraph.getCenterBubbleInTree();
            bubble2 = threeBubblesGraph.getBubble2InTree();
            graphWithHiddenSimilarRelationsScenario = new Scenarios.getGraphWithHiddenSimilarRelations();
            mergeBubbleScenario = new Scenarios.mergeBubbleGraph();
            graphWithSimilarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelation = graphWithSimilarRelationsScenario.getPossessionAsGroupRelationInTree();
            karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
        });

        it("distributes triples evenly to the right and left", function () {
            var centerBubble = CenterBubble.usingBubble(bubble1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToLeft()
            ).toBe(1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToRight()
            ).toBe(1);
        });

        it("distributes new triples evenly to the right and left", function () {
            var firstAddedEdge = Scenarios.addTriple(bubble1).edge(),
                secondAddedEdge = Scenarios.addTriple(bubble1).edge();
            expect(
                firstAddedEdge.isToTheLeft()
            ).toBeFalsy();
            expect(
                secondAddedEdge.isToTheLeft()
            ).toBeTruthy();
        });

        it("appends to group relation when expanding", function () {
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
            var locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            bubble2.setSuggestions(
                [
                    locationSuggestion
                ]
            );
            GraphDisplayerAsRelativeTree.showSuggestions(bubble2);
            var relationSuggestion = bubble2.getTopMostChildBubble(),
                vertexSuggestion = relationSuggestion.getTopMostChildBubble();
            expect(
                relationSuggestion.text()
            ).toBe("location");
            expect(
                vertexSuggestion.getIdentifications()[0].getLabel()
            ).toBe("Location");
        });
        it("can make a vertex connect to a distant vertex", function () {
            connectDistantVertexTest(function(distantBubble){
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    connectedBubble.text()
                ).toBe("b2");
            });
        });

        it("when connecting to a distant vertex, similar relations are grouped", function(){
            connectDistantVertexTest(function(distantBubble){
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                var tShirtBubble = new Scenarios.TreeQuerier(
                    connectedBubble.getChildrenContainer()
                ).getGroupRelationWithLabelInTree("T-shirt");
                expect(
                    tShirtBubble.isGroupRelation()
                ).toBeTruthy();
            });
        });
        it("when connecting to a distant vertex, distant vertex child bubbles have their images", function(){
            connectDistantVertexTest(function(distantBubble){
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    connectedBubble.hasImagesMenu()
                ).toBeTruthy();
            });
        });
        it("when connecting to a distant vertex, new relation has focus", function(){
            connectDistantVertexTest(function(distantBubble){
                var newRelation = distantBubble.getTopMostChildBubble();
                expect(
                    newRelation.isRelation()
                ).toBeTruthy();
                expect(
                    "true" === newRelation.getLabel().attr("contenteditable")
                ).toBeTruthy();
            });
        });
        it("contains all elements for deep circular graph", function(){
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

        function connectDistantVertexTest(callback){
            Mock.setGetGraphFromService(
                graphWithHiddenSimilarRelationsScenario.getB2GraphWhenConnectedToDistantBubble()
            );
            var distantBubble = distantGraphScenario.getBubbleInTree(),
                hasVisitedCallback = false,
                bubble2 = graphWithHiddenSimilarRelationsScenario.getBubble2();
            GraphDisplayerAsRelativeTree.connectVertexToVertexWithUri(
                distantBubble,
                bubble2.getUri(),
                function () {
                    hasVisitedCallback = true;
                    callback(distantBubble);
                }
            );
            expect(
                hasVisitedCallback
            ).toBeTruthy();
        }
    });
});