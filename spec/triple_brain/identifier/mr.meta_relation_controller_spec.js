/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'jquery',
    'test/test-scenarios',
    'test/test-utils',
    'test/mock'
], function ($, Scenarios, TestUtils, Mock) {
    "use strict";
    describe("meta-ui-relation", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        xit("can remove a meta relation", function () {
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var relation = eventBubble.getTopMostChildBubble();
            relation.getController().remove();
        });

        it("removes the meta to the vertex if it's a vertex that is related to the meta center", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var hasBeenCalled = false;
            Mock.getSpy(
                "GraphElementService",
                "removeIdentifier"
            ).and.callFake(function(graphElement){
                expect(
                    graphElement.isVertex()
                ).toBeTruthy();
                hasBeenCalled = true;
                return $.Deferred().resolve();
            });
            eventBubble.getTopMostChildBubble().getController().remove(true);
            expect(
                hasBeenCalled
            ).toBeTruthy();
        });

        it("removes the meta to the edge if it's an edge that is related to the meta center", function(){
            var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
            var hasBeenCalled = false;
            Mock.getSpy(
                "GraphElementService",
                "removeIdentifier"
            ).and.callFake(function(graphElement){
                expect(
                    graphElement.isEdge()
                ).toBeTruthy();
                hasBeenCalled = true;
                return $.Deferred().resolve();
            });
            var metaRelation = TestUtils.getChildWithLabel(
                toDoMetaBubble,
                "f1"
            );
            expect(
                metaRelation.isMetaRelation()
            ).toBeTruthy();
            metaRelation.getController().remove(true);
            expect(
                hasBeenCalled
            ).toBeTruthy();
        });
    });
});
