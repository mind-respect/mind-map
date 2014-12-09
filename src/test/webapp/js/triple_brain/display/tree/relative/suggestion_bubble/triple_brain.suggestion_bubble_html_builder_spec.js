/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios",
    "triple_brain.suggestion_bubble_html_builder",
    "triple_brain.ui.graph"
], function (Scenarios, SuggestionBubbleHtmlBuilder, GraphUi) {
    "use strict";
    describe("suggestion_bubble_html_builder", function () {
        var suggestion,
            locationBubbleSuggestion;
        beforeEach(function () {
            var suggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
            suggestion = suggestionScenario.getOneSuggestion();
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph(),
                locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            locationBubbleSuggestion = SuggestionBubbleHtmlBuilder.withServerFacade(
                locationSuggestion
            ).create();
        });
        it("can build from server facade", function () {
            var uiId = GraphUi.generateBubbleHtmlId();
            var suggestionUi = SuggestionBubbleHtmlBuilder.withServerFacade(
                suggestion
            ).create(uiId);
            expect(
                suggestionUi.getId()
            ).toBe(uiId);
            expect(
                suggestionUi.getUri()
            ).toBe(suggestion.getUri());
        });
        it("if no uiId is specified it generates one", function () {
            var suggestionUi = SuggestionBubbleHtmlBuilder.withServerFacade(
                suggestion
            ).create();
            expect(
                suggestionUi.getId()
            ).toBeDefined();
        });
        it("builds empty label bubble", function () {
            expect(
                locationBubbleSuggestion.text()
            ).toBe("");
        });
    });
});