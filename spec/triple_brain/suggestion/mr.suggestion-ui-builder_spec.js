/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "mr.suggestion-ui-builder",
    "triple_brain.bubble",
    "triple_brain.graph_ui",
    "triple_brain.event_bus"
], function (Scenarios, TestUtils, Mock, SuggestionUiBuilder, Bubble, GraphUi, EventBus) {
    "use strict";
    describe("suggestion_bubble_html_builder", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        var suggestion,
            locationBubbleSuggestion,
            locationSuggestion;
        beforeEach(function () {
            var suggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
            suggestion = suggestionScenario.getOneSuggestion();
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
            locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            locationBubbleSuggestion = new SuggestionUiBuilder.SuggestionUiBuilder().create(locationSuggestion);
            spyOn(Bubble.Bubble.prototype, "addIdentification").and.callFake(function(){});
            SuggestionUiBuilder.completeBuild(locationBubbleSuggestion);
        });
        it("can build from server facade", function () {
            var uiId = GraphUi.generateBubbleHtmlId();
            var suggestionUi = new SuggestionUiBuilder.SuggestionUiBuilder().create(suggestion, uiId);
            expect(
                suggestionUi.getId()
            ).toBe(uiId);
            expect(
                suggestionUi.getUri()
            ).toBe(suggestion.getUri());
        });
        it("if no uiId is specified it generates one", function () {
            var suggestionUi = new SuggestionUiBuilder.SuggestionUiBuilder().create(suggestion);
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
                locationBubbleSuggestion.getSuggestion().getType().getUri()
            ).toBe(locationSuggestion.getType().getUri());
        });
        it('has suggestion "same as" as identification', function () {
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
            locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            locationBubbleSuggestion = new SuggestionUiBuilder.SuggestionUiBuilder().create(locationSuggestion);
            expect(
                locationBubbleSuggestion.getModel().getIdentifiers()[0].getUri()
            ).toBe(locationSuggestion.getSameAs().getUri());
        });
        it('has the suggestion label for its type taken from the suggestion "same as"', function () {
            expect(
                locationBubbleSuggestion.getModel().getIdentifiers()[0].getLabel()
            ).toBe("location");
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