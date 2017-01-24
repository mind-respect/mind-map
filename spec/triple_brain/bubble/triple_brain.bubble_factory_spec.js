/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    'test/mock',
    "triple_brain.bubble_factory"
], function (Scenarios, Mock, BubbleFactory) {
    "use strict";
    describe("bubble_factory", function () {
        var vertexUi,
            relationUi,
            groupRelationUi,
            vertexSuggestionUi,
            relationSuggestionUi,
            schemaUi,
            propertyUi;
        beforeEach(function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            vertexUi = threeBubblesScenario.getBubble1Ui();
            relationUi = threeBubblesScenario.getRelation1Ui();
            groupRelationUi = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationUi();
            var oneBubbleWithSuggestionsScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
            vertexSuggestionUi = oneBubbleWithSuggestionsScenario.getAVertexSuggestionUi();
            relationSuggestionUi = oneBubbleWithSuggestionsScenario.getARelationSuggestionUi();
            var karaokeScenario = new Scenarios.getKaraokeSchemaGraph();
            schemaUi = karaokeScenario.getSchemaUi();
            propertyUi = karaokeScenario.getInviteesPropertyUi();
            Mock.applyDefaultMocks();
        });
        it("can return vertex ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    vertexUi.getHtml()
                ).isVertex()
            ).toBeTruthy();
        });
        it("can return relation ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    relationUi.getHtml()
                ).isRelation()
            ).toBeTruthy();
        });
        it("can return group relation ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    groupRelationUi.getHtml()
                ).isGroupRelation()
            ).toBeTruthy();
        });
        it("can return vertex suggestion ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    vertexSuggestionUi.getHtml()
                ).isVertexSuggestion()
            ).toBeTruthy();
        });
        it("can return edge suggestion ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    relationSuggestionUi.getHtml()
                ).isRelationSuggestion()
            ).toBeTruthy();
        });
        it("can return schema ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    schemaUi.getHtml()
                ).isSchema()
            ).toBeTruthy();
        });
        it("can return property ui facade from html", function () {
            expect(
                BubbleFactory.fromHtml(
                    propertyUi.getHtml()
                ).isProperty()
            ).toBeTruthy();
        });
        it("can get from sub element", function () {
            expect(
                BubbleFactory.fromSubHtml(
                    vertexUi.getMenuHtml()
                ).isVertex()
            ).toBeTruthy();
            expect(
                BubbleFactory.fromSubHtml(
                    relationUi.getLabel()
                ).isRelation()
            ).toBeTruthy();
            expect(
                BubbleFactory.fromSubHtml(
                    groupRelationUi.getLabel()
                ).isGroupRelation()
            ).toBeTruthy();
            expect(
                BubbleFactory.fromSubHtml(
                    vertexSuggestionUi.getHtml()
                ).isVertexSuggestion()
            ).toBeTruthy();
            expect(
                BubbleFactory.fromSubHtml(
                    relationSuggestionUi.getLabel()
                ).isRelationSuggestion()
            ).toBeTruthy();
            expect(
                BubbleFactory.fromSubHtml(
                    schemaUi.getMenuHtml()
                ).isSchema()
            ).toBeTruthy();
        });
    });
});