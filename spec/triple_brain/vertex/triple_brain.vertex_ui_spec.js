/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, Mock, SelectionHandler) {
    "use strict";
    describe("vertex_ui", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("removes suggestions related to an identification when identification removed", function () {
            var vertexWithEventRelatedSuggestions = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(2);
            vertexWithEventRelatedSuggestions.addSuggestions([
                    new Scenarios.getKaraokeSchemaGraph().getInviteesPropertyAsSuggestion()
                ]
            );
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(3);
            vertexWithEventRelatedSuggestions.removeIdentifier(
                vertexWithEventRelatedSuggestions.getModel().getIdentifiers()[0]
            );
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(1);
        });

        it("shows suggestions when new suggestions are added", function () {
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            expect(
                bubble2.hasChildren()
            ).toBeFalsy();
            var suggestions = [
                new Scenarios.getKaraokeSchemaGraph().getLocationPropertyAsSuggestion()
            ];
            bubble2.addSuggestions(
                suggestions
            );
            expect(
                bubble2.hasChildren()
            ).toBeTruthy();
        });
        it("can return it's deepest child distance", function () {
            var deepGraphB1 = new Scenarios.deepGraph().getBubble1InTree();
            expect(
                deepGraphB1.getDeepestChildDistance()
            ).toBe(2);
            var centerInTree = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                centerInTree.getDeepestChildDistance()
            ).toBe(1);
        });
        it("selects the parent vertex when removed", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var b2 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            ).getTopMostChildBubble();
            SelectionHandler.setToSingleVertex(b2);
            expect(
                b1.isSelected()
            ).toBeFalsy();
            b2.remove();
            expect(
                b1.isSelected()
            ).toBeTruthy();
        });
        it("can check if it's connected to another vertex with uri even if it has group relations", function () {
            var center = new Scenarios.GraphWithSimilarRelationsScenario().getCenterVertexInTree();
            expect(
                center.isConnectedToAVertexWithUri("dummy")
            ).toBeFalsy();
        });
        it("can remove a vertex under a meta bubble", function () {
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var vertex = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            var numberOfChild = eventBubble.getNumberOfChild();
            vertex.remove();
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
        it("selects the parent vertex after it's removed if right under a relation and vertex", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            expect(
                otherBubble._getParentBubbleToSelectAfterRemove().isVertex()
            ).toBeTruthy();
        });
        it("selects the group relation after it's removed if right under a relation and group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var vertexUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            ).getTopMostChildBubble();
            expect(
                vertexUnderGroupRelation.isVertex()
            ).toBeTruthy();
            expect(
                vertexUnderGroupRelation._getParentBubbleToSelectAfterRemove().isGroupRelation()
            ).toBeTruthy();
        });
        it("selects the parent vertex after remove if it was the last vertex under a group relation", function () {
            var centerBubble = new Scenarios.withRelationsAsIdentifierGraph().getCenterInTree();
            expect(
                centerBubble.isSelected()
            ).toBeFalsy();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "original some relation"
            );
            groupRelation.visitClosestChildVertices(function (vertex) {
                vertex.remove();
            });
            expect(
                centerBubble.isSelected()
            ).toBeTruthy();
        });
        describe("buildChildrenIndex", function () {
            it("is in right order", function () {
                var scenario = new Scenarios.creationDateScenario();
                var b7 = scenario.getBubble7InTree();
                scenario.expandBubble7(
                    b7
                );
                var childrenIndexes = b7.buildChildrenIndex();
                var b71 = TestUtils.getChildWithLabel(
                    b7,
                    "r71"
                ).getTopMostChildBubble();
                var b72 = TestUtils.getChildWithLabel(
                    b7,
                    "r72"
                ).getTopMostChildBubble();
                expect(
                    childrenIndexes[b71.getUri()].index
                ).toBe(0);
                expect(
                    childrenIndexes[b72.getUri()].index
                ).toBe(1);
            });
            it("includes child vertices of inverse relations", function () {
                var scenario = new Scenarios.creationDateScenario();
                var b7 = scenario.getBubble7InTree();
                scenario.expandBubble7(
                    b7
                );
                var childrenIndexes = b7.buildChildrenIndex();
                var r71 = TestUtils.getChildWithLabel(
                    b7,
                    "r71"
                );
                r71.inverse();
                var b71 = r71.getTopMostChildBubble();
                expect(
                    childrenIndexes.hasOwnProperty(b71.getUri())
                ).toBeTruthy()
            });
            it("includes child vertices under group relations", function () {
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                var groupRelation = TestUtils.getChildWithLabel(
                    center,
                    "Possession"
                );
                groupRelation.expand();
                var groupRelationUnder = groupRelation.getTopMostChildBubble();
                groupRelationUnder.expand();
                var vertexUnderDeepGroupRelation = groupRelationUnder.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    vertexUnderDeepGroupRelation.isVertex()
                ).toBeTruthy();
                var vertexUnderGroupRelation = groupRelationUnder.getBubbleUnder().getTopMostChildBubble();
                expect(
                    vertexUnderGroupRelation.isVertex()
                ).toBeTruthy();
                var childrenIndexes = center.buildChildrenIndex();
                expect(
                    childrenIndexes.hasOwnProperty(vertexUnderGroupRelation.getUri())
                ).toBeTruthy();
                expect(
                    childrenIndexes.hasOwnProperty(vertexUnderDeepGroupRelation.getUri())
                ).toBeTruthy()
            });
        });
    });
});