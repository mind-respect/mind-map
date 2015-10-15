/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.event_bus"
], function (Scenarios, TestUtils) {
    "use strict";
    describe("vertex_ui", function () {
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
            vertexWithEventRelatedSuggestions.impactOnRemovedIdentification(
                vertexWithEventRelatedSuggestions.getIdentifications()[0]
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
        it("makes outgoing edge private when making vertex private", function(){
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getHtml()
            ).toHaveClass("public");
            bubble1.makePrivate();
            expect(
                relation1.getHtml()
            ).not.toHaveClass("public");
        });
        it("makes incoming edge private when making vertex private", function(){
            var bubble2 = new Scenarios.publicPrivate().getBubble2();
            var relation1 = bubble2.getParentBubble();
            expect(
                relation1.getHtml()
            ).toHaveClass("public");
            bubble2.makePrivate();
            expect(
                relation1.getHtml()
            ).not.toHaveClass("public");
        });
        it("makes edge public when making both vertices public", function(){
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            bubble1.makePrivate();
            var relation2 = TestUtils.getChildWithLabel(bubble1, "r2");
            var bubble2 = relation2.getTopMostChildBubble();
            expect(
                relation2.getHtml()
            ).not.toHaveClass("public");
            bubble2.makePublic();
            expect(
                relation2.getHtml()
            ).not.toHaveClass("public");
            bubble1.makePublic();
            expect(
                relation2.getHtml()
            ).toHaveClass("public");
        });
    });
});