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
        it("takes the type and same as of a suggestion and sets them as identifications", function(){
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
        it("does not fail if suggestion has no type", function(){
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            vertexSuggestionInTree._getServerFacade()._setType(undefined);
            var graphElement = GraphElement.fromSuggestionAndElementUri(
                vertexSuggestionInTree._getServerFacade(),
                TestUtils.generateVertexUri()
            );
            expect(
                graphElement.getTypes().length
            ).toBe(0);
        });
    });
});