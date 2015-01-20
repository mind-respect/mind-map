/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "test/webapp/js/test-scenarios"
], function (Scenarios) {
    "use strict";
    describe("suggestion_bubble_ui", function () {
        var oneSuggestionScenario;
        beforeEach(function () {
            oneSuggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
        });
        it("does not update the label of other bubbles on the map that are the same suggestion", function () {
            var suggestion = oneSuggestionScenario.getAVertexSuggestionUi(),
                sameSuggestion = oneSuggestionScenario.getAVertexSuggestionUi();
            suggestion.getLabel().text("test").blur();
            expect(
                suggestion.text()
            ).toBe("test");
            expect(
                sameSuggestion.text()
            ).not.toBe("test");
        });
    });
});