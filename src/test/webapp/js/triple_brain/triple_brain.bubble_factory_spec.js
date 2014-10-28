/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios",
    "triple_brain.bubble_factory"
], function (Scenarios, BubbleFactory) {
    "use strict";
    describe("bubble_factory", function () {
        var bubble1, relation1, groupRelation, vertexSuggestion, relationSuggestion;
        beforeEach(function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            bubble1 = threeBubblesScenario.getBubble1Ui();
            relation1 = threeBubblesScenario.getRelation1Ui();
            groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationUi();
            var oneBubbleWithSuggestionsScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
            vertexSuggestion = oneBubbleWithSuggestionsScenario.getAVertexSuggestionUi();
            relationSuggestion = oneBubbleWithSuggestionsScenario.getARelationSuggestionUi();
        });
        it("can return vertex ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    bubble1.getHtml()
                ).isVertex()
            ).toBeTruthy();
        });
        it("can return relation ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    relation1.getHtml()
                ).isRelation()
            ).toBeTruthy();
        });
        it("can return group relation ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    groupRelation.getHtml()
                ).isGroupRelation()
            ).toBeTruthy();
        });
        it("can return vertex suggestion ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    vertexSuggestion.getHtml()
                ).isVertexSuggestion()
            ).toBeTruthy();
        });
        it("can return edge suggestion ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    relationSuggestion.getHtml()
                ).isRelationSuggestion()
            ).toBeTruthy();
        });
    });
});