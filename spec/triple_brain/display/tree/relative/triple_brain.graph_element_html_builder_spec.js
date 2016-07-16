/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.suggestion_service_mock",
    "test/mock/triple_brain.friendly_resource_service_mock",
    "test/mock/triple_brain.graph_element_service_mock",
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, SuggestionServiceMock, FriendlyResourceServiceMock, GraphElementServiceMock, GraphDisplayerAsRelativeTree, MindMapInfo) {
    "use strict";
    describe("graph_element_html_builder", function () {
        it("does not update label to service if label has not changed", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var bubble1Label = bubble1.getLabel();
            var updateLabelInServiceSpy = FriendlyResourceServiceMock.updateLabel();
            expect(
                updateLabelInServiceSpy
            ).not.toHaveBeenCalled();

            bubble1.focus();
            bubble1Label.append("");
            bubble1Label.blur();
            expect(
                updateLabelInServiceSpy
            ).not.toHaveBeenCalled();
            bubble1Label.focus();
            bubble1Label.append("new text");
            bubble1Label.blur();
            expect(
                updateLabelInServiceSpy
            ).toHaveBeenCalled();
        });

        it("does not accept suggestion if label has not changed", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            SuggestionServiceMock.acceptSuggestion();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            var vertexSuggestionLabel = vertexSuggestionInTree.getLabel();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("");
            vertexSuggestionLabel.blur();
            vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("new text");
            vertexSuggestionLabel.blur();
            vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeFalsy();
        });
        it("accepts relation and vertex suggestion if relation label is changed", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var relationSuggestion = eventBubble.getTopMostChildBubble();
            var vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            SuggestionServiceMock.acceptSuggestion();
            expect(
                relationSuggestion.isRelationSuggestion()
            ).toBeTruthy();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            var relationLabel = relationSuggestion.getLabel();
            relationSuggestion.focus();
            relationLabel.append("new text");
            relationLabel.blur();
            relationSuggestion = eventBubble.getTopMostChildBubble();
            vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            expect(
                relationSuggestion.isRelationSuggestion()
            ).toBeFalsy();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeFalsy();
        });
        
        it("shows note button only if element has a note", function () {
            loadFixtures('graph-element-menu.html');
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble1InTree = threeBubblesGraph.getBubble1InTree();
            expect(
                bubble1InTree.hasNote()
            ).toBeFalsy();
            expect(
                bubble1InTree.getNoteButtonInBubbleContent().hasClass("hidden")
            ).toBeTruthy();
            var bubble3InTree = threeBubblesGraph.getBubble3InTree();
            expect(
                bubble3InTree.hasNote()
            ).toBeTruthy();
            expect(
                bubble3InTree.getNoteButtonInBubbleContent().hasClass("hidden")
            ).toBeFalsy();
        });
        it("identifies edge to group relation when dropped on group relation", function () {
            MindMapInfo._setIsViewOnly(
                false
            );
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelationUi = scenario.getPossessionAsGroupRelationInTree();
            var otherRelation = scenario.getOtherRelationInTree();
            var groupRelationIdentification = groupRelationUi.getModel().getIdentification();
            expect(
                otherRelation.hasIdentification(
                    groupRelationIdentification
                )
            ).toBeFalsy();
            var otherBubble = otherRelation.getTopMostChildBubble();
            GraphElementServiceMock.addIdentification();
            TestUtils.startDragging(
                otherBubble
            );
            TestUtils.drop(groupRelationUi);
            expect(
                otherRelation.hasIdentification(
                    groupRelationIdentification
                )
            ).toBeTruthy();
        });
    });
});