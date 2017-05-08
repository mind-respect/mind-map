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
            expect(
                scenario.getEvent1()
            ).toBeDefined();
            expect(
                scenario.getEvent2()
            ).toBeDefined();
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
    });
});