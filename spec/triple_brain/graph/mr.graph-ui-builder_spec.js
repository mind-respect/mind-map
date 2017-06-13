/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "mr.graph-ui-builder"
], function (Scenarios, TestUtils, Mock, GraphUiBuilder) {
    "use strict";
    describe("graph-ui-builder", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can show a bubble suggestions", function () {
            var karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            var locationSuggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            bubble2.getModel().setSuggestions(
                [
                    locationSuggestion
                ]
            );
            GraphUiBuilder.addSuggestionsToVertex(
                bubble2.getModel().getSuggestions(),
                bubble2
            );
            var relationSuggestion = bubble2.getTopMostChildBubble(),
                vertexSuggestion = relationSuggestion.getTopMostChildBubble();
            expect(
                relationSuggestion.text()
            ).toBe("location");
            expect(
                vertexSuggestion.getModel().getType().getLabel()
            ).toBe("Location");
        });
        it("does not show already accepted suggestions", function () {
            var centerBubble = new Scenarios.withAcceptedSuggestionGraph().getCenterBubbleInTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "start date"
                )
            ).toBeTruthy();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "venue"
                )
            ).toBeTruthy();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "Person"
                )
            ).toBeTruthy();
        });
        it("does not create multiple relations when relations on the same level sharing more than one common meta", function(){
            var scenario = new Scenarios.sameLevelRelationsWithMoreThanOneCommonMetaScenario();
            var centerBubble = scenario.getCenterBubbleInTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(2);
        });
    });
});