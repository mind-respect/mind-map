/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/webapp/js/test-scenarios"
], function (Scenarios) {
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
    });
});