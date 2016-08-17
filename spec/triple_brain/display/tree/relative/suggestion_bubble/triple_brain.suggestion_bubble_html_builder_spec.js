/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.suggestion_bubble_html_builder",
    "triple_brain.bubble",
    "triple_brain.graph_ui",
    "triple_brain.event_bus",
    "triple_brain.sub_graph"
], function (Scenarios, TestUtils, SuggestionBubbleHtmlBuilder, Bubble, GraphUi, EventBus, SubGraph) {
    "use strict";
    describe("suggestion_bubble_html_builder", function () {
        var suggestion,
            locationBubbleSuggestion,
            locationSuggestion;
        beforeEach(function () {
            var suggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
            suggestion = suggestionScenario.getOneSuggestion();
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
            locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            locationBubbleSuggestion = SuggestionBubbleHtmlBuilder.withServerFacade(
                locationSuggestion
            ).create();
            spyOn(Bubble.Bubble.prototype, "integrateIdentification").and.callFake(function(){});
            SuggestionBubbleHtmlBuilder.completeBuild(locationBubbleSuggestion);
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
        it("has suggestion type as identification", function () {
            expect(
                locationBubbleSuggestion.getTypes()[0].getUri()
            ).toBe(locationSuggestion.getType().getUri());
        });
        it('has suggestion "same as" as identification', function () {
            expect(
                locationBubbleSuggestion.getTypes()[1].getUri()
            ).toBe(locationSuggestion.getSameAs().getUri());
        });
        it('has the suggestion label for its type taken from the suggestion "same as"', function () {
            expect(
                locationBubbleSuggestion.getTypes()[1].getLabel()
            ).toBe(locationSuggestion.getLabel());
        });
        it("publishes that it created a suggestion bubble ui", function(){
            var hasPublished = false;
            EventBus.subscribe("suggestion_ui_shown", function(){
               hasPublished = true;
            });
            new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            expect(
                hasPublished
            ).toBeTruthy();
        });
    });
});