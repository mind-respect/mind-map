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
], function (Scenarios, TestUtils, SuggestionService, GraphDisplayerAsRelativeTree, SelectionHandler, EventBus) {
    "use strict";
    describe("suggestion_bubble_ui", function () {
        var oneSuggestionScenario;
        beforeEach(function () {
            oneSuggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
        });
        it("does not update the label of other bubbles on the map that are the same suggestion", function () {
            SuggestionService.accept = function(){};
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
        it("can remove newly accepted suggestion", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.showSuggestions(eventBubble);
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            vertexSuggestionInTree.integrateUsingNewVertexAndEdgeUri(
                TestUtils.generateVertexUri(),
                TestUtils.generateEdgeUri()
            );
            var newVertex = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                eventBubble.hasChildren()
            ).toBeTruthy();
            var numberOfChild = eventBubble.getNumberOfChild();
            newVertex.remove();
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
        it("can take subscribers that get notified when bubble is integrated", function () {
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            var promiseOfIntegrationHasBeenResolved = false;
            vertexSuggestionInTree.whenItIntegrates().then(function(){
                promiseOfIntegrationHasBeenResolved = true;
            });
            expect(
                promiseOfIntegrationHasBeenResolved
            ).toBeFalsy();
            vertexSuggestionInTree.integrate();
            expect(
                promiseOfIntegrationHasBeenResolved
            ).toBeTruthy();
        });
        it("returns the new vertex when it notifies for integration", function () {
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            var isASuggestion = true;
            vertexSuggestionInTree.whenItIntegrates().then(function(newVertex){
                isASuggestion = newVertex.isSuggestion();
            });
            expect(
                isASuggestion
            ).toBeTruthy();
            vertexSuggestionInTree.integrate();
            expect(
                isASuggestion
            ).toBeFalsy();
        });
        it("updates selection handler to new vertex after integration", function () {
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            SelectionHandler.setToSingleGraphElement(vertexSuggestionInTree);
            expect(
                SelectionHandler.getSingleElement().isSuggestion()
            ).toBeTruthy();
            expect(
                SelectionHandler.getSingleElement().isVertex()
            ).toBeFalsy();
            vertexSuggestionInTree.integrate();
            expect(
                SelectionHandler.getSingleElement().isSuggestion()
            ).toBeFalsy();
            expect(
                SelectionHandler.getSingleElement().isVertex()
            ).toBeTruthy();
        });
        it("updates selection handler to new vertex after integration", function () {

        });
        it("publishes throught event bus that the vertex build is completed after integration", function(){
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            var hasCompletedBuild = false;
            EventBus.subscribe('/event/ui/vertex/build_complete', function(){
                hasCompletedBuild = true;
            });
            vertexSuggestionInTree.integrate();
            expect(
                hasCompletedBuild
            ).toBeTruthy();
        });
        it("can handle label update when it has no type", function(){
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            vertexSuggestionInTree.getSuggestion()._setType(undefined);
            vertexSuggestionInTree.setText("bingo");
            vertexSuggestionInTree.getLabel().blur();
            expect(
                vertexSuggestionInTree.getModel().getLabel()
            ).toBe(
                "bingo"
            );
        });
    });
});