/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.suggestion_service",
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.selection_handler",
    "triple_brain.event_bus"
], function (Scenarios) {
    "use strict";
    describe("suggestion_relation_ui", function () {
        it("can handle label update", function(){
            var relationSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree().getParentBubble();
            relationSuggestionInTree.getSuggestion()._setType(undefined);
            relationSuggestionInTree.setText("bingo");
            relationSuggestionInTree.getLabel().blur();
            expect(
                relationSuggestionInTree.getModel().getLabel()
            ).toBe(
                "bingo"
            );
        });
    });
});