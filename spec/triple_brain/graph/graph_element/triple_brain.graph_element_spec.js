/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.graph_element"
], function (Scenarios, TestUtils, GraphElement) {
    "use strict";
    describe("graph_element", function () {
        it("takes the type and same as of a suggestion and sets them as identifications for the graph element when build from suggestion", function(){
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            var graphElement = GraphElement.fromSuggestionAndElementUri(
                vertexSuggestionInTree._getServerFacade(),
                TestUtils.generateVertexUri()
            );
            expect(
                graphElement.getSameAs().length
            ).toBe(1);
            expect(
                graphElement.getTypes().length
            ).toBe(1);
        });
    });
});