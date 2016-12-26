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
                vertexSuggestionInTree.getSuggestion(),
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
            vertexSuggestionInTree.getSuggestion()._setType(undefined);
            var graphElement = GraphElement.fromSuggestionAndElementUri(
                vertexSuggestionInTree.getSuggestion(),
                TestUtils.generateVertexUri()
            );
            expect(
                graphElement.getTypes().length
            ).toBe(0);
        });
        it("includes identifiers when building server format from ui", function(){
            var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            var serverFormat = GraphElement.buildServerFormatFromUi(
                eventBubble
            );
            var graphElement = GraphElement.fromServerFormat(
                serverFormat
            );
            expect(
                graphElement.getIdentifiers().length
            ).toBeGreaterThan(0);
        });
        it("has right label for self identifier even if it changed", function(){
            var r1 = new Scenarios.threeBubblesGraph().getRelation1InTree();
            r1.getController().setLabel("new r1 label");
            var selfIdentifier = r1.getModel().getIdentifiersIncludingSelf()[0];
            expect(
                selfIdentifier.getLabel()
            ).toBe("new r1 label");
        });
        it("prevents from adding same identifier twice", function(){
            var b1 = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
            var identifier = TestUtils.dummyIdentifier();
            expect(
                b1.getModel().getIdentifiers().length
            ).toBe(0);
            b1.getModel().addIdentification(
                identifier
            );
            expect(
                b1.getModel().getIdentifiers().length
            ).toBe(1);
            b1.getModel().addIdentification(
                identifier
            );
            expect(
                b1.getModel().getIdentifiers().length
            ).toBe(1);
        });
        it("prevents from adding self as identifier", function(){
            var b1 = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
            expect(
                b1.getModel().getIdentifiers().length
            ).toBe(0);
            b1.addIdentification(
                b1.getModel()._buildSelfIdentifier()
            );
            expect(
                b1.getModel().getIdentifiers().length
            ).toBe(0);
        });
    });
});