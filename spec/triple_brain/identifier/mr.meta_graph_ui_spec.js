/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'jquery',
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.graph_element_type',
    'triple_brain.selection_handler'
], function ($, Scenarios, TestUtils, Mock, GraphElementType, SelectionHandler) {
    "use strict";
    describe("meta-graph-ui", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("displays the meta center identifier as the center bubble", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            expect(
                eventBubble.isCenterBubble()
            ).toBeTruthy();
        });
        it("sets right graph element type to meta bubble", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            expect(
                eventBubble.getGraphElementType()
            ).toBe(GraphElementType.Meta);
        });
        it("has the label", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            expect(
                eventBubble.text()
            ).toBe("Event");
        });
        it("displays the related bubbles", function(){
            var scenario = new Scenarios.aroundEventIdentifier();
            var eventCenter = scenario.getEventBubbleInTree();
            var event1 = TestUtils.getChildWithLabel(
                eventCenter,
                "e1"
            ).getTopMostChildBubble();
            expect(
                event1.isVertex()
            ).toBeTruthy();
            var event2 = TestUtils.getChildWithLabel(
                eventCenter,
                "e2"
            ).getTopMostChildBubble();
            expect(
                event2.isVertex()
            ).toBeTruthy();
        });
        it("builds relation of type meta", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var relation = eventBubble.getTopMostChildBubble();
            expect(
                relation.getGraphElementType()
            ).toBe(GraphElementType.MetaRelation);
        });
        //cant make test
        xit("prevents from editing relations of type meta", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var relation = eventBubble.getTopMostChildBubble();
            SelectionHandler.setToSingleRelation(
                relation
            );
            expect(
                relation.text()
            ).toBe("meta");
            TestUtils.pressKeyInBubble("l", relation);
            TestUtils.pressEnterInBubble(relation);
            expect(
                relation.text()
            ).toBe("meta");
        });
        it("inverts the meta relations", function(){
            var eventMetaBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var relation = eventMetaBubble.getTopMostChildBubble();
            var eventBubble = relation.getTopMostChildBubble();
            expect(
                relation.isInverse()
            ).toBeTruthy();
            expect(
                relation.getModel().getSourceVertex().getUri()
            ).toBe(
                eventBubble.getModel().getUri()
            );
            expect(
                relation.getModel().getDestinationVertex().getUri()
            ).toBe(
                eventMetaBubble.getModel().getUri()
            );
        });
        it("groups tagged edges by source vertex", function(){
            var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
            expect(
                toDoMetaBubble.getNumberOfChild()
            ).toBe(2);
            expect(TestUtils.hasChildWithLabel(
                toDoMetaBubble,
                "e1"
            )).toBeTruthy();
            var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
                toDoMetaBubble,
                "e1"
            ).getTopMostChildBubble();
            sourceVertexAsGroupRelation.expand();
            expect(
                sourceVertexAsGroupRelation.getNumberOfChild()
            ).toBe(2);
            var e2 = TestUtils.getChildWithLabel(
                sourceVertexAsGroupRelation,
                "r1"
            ).getTopMostChildBubble();
            expect(
                e2.text()
            ).toBe("e2");
        });
        it("collapses group source vertices", function(){
            var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
            var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
                toDoMetaBubble,
                "e1"
            ).getTopMostChildBubble();
            expect(
                sourceVertexAsGroupRelation.isCollapsed()
            ).toBeTruthy();
        });
        it("has the number of tagged relations for source vertex groups", function(){
            var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
            var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
                toDoMetaBubble,
                "e1"
            ).getTopMostChildBubble();
            expect(
                sourceVertexAsGroupRelation.getNumberOfHiddenRelations()
            ).toBe(2);
        });
        it("excludes the source vertex in it's number of hidden child for a vertex under a source vertex", function(){
            var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
            var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
                toDoMetaBubble,
                "e1"
            ).getTopMostChildBubble();
            var e2 = TestUtils.getChildWithLabel(
                sourceVertexAsGroupRelation,
                "r1"
            ).getTopMostChildBubble();
            expect(
                e2.getNumberOfHiddenRelations()
            ).toBe(0);
        });
        xit("excludes the source vertex in it's child for a vertex under a source vertex", function(){
            expect(false).toBeTruthy();
        });
    });
});