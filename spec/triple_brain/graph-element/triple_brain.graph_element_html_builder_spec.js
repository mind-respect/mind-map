/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "test/mock/triple_brain.suggestion_service_mock",
    "triple_brain.suggestion_service",
    "mr.graph-ui-builder",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info"
], function ($, Scenarios, TestUtils, Mock, SuggestionServiceMock, SuggestionService, GraphUiBuilder, SelectionHandler, MindMapInfo) {
    "use strict";
    describe("graph_element_html_builder", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("does not update label to service if label has not changed", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var bubble1Label = bubble1.getLabel();
            var updateLabelInServiceSpy = Mock.getSpy(
                "FriendlyResourceService",
                "updateLabel"
            );
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
            GraphUiBuilder.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            SuggestionServiceMock.accept();
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
            GraphUiBuilder.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var relationSuggestion = eventBubble.getTopMostChildBubble();
            var vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            SuggestionServiceMock.accept();
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
                bubble1InTree.getModel().hasComment()
            ).toBeFalsy();
            expect(
                bubble1InTree.getNoteButtonInBubbleContent().hasClass("hidden")
            ).toBeTruthy();
            var bubble3InTree = threeBubblesGraph.getBubble3InTree();
            expect(
                bubble3InTree.getModel().hasComment()
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
                otherRelation.getModel().hasIdentification(
                    groupRelationIdentification
                )
            ).toBeFalsy();
            var otherBubble = otherRelation.getTopMostChildBubble();
            TestUtils.startDragging(
                otherBubble
            );
            TestUtils.drop(groupRelationUi);
            expect(
                otherRelation.getModel().hasIdentification(
                    groupRelationIdentification
                )
            ).toBeTruthy();
        });
        it("makes a relation a group relation when dropping on it", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            expect(
                TestUtils.getChildWithLabel(
                    b1,
                    "r1"
                ).isGroupRelation()
            ).toBeFalsy();
            var b3 = scenario.getBubble3InTree();
            var r1 = scenario.getRelation1InTree();
            TestUtils.startDragging(
                b3
            );
            TestUtils.drop(
                r1
            );
            expect(
                TestUtils.getChildWithLabel(
                    b1,
                    "r1"
                ).isGroupRelation()
            ).toBeTruthy();
        });
        it("removes the identification when dragging out of a group relation", function () {
            MindMapInfo._setIsViewOnly(
                false
            );
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelationUi = scenario.getPossessionAsGroupRelationInTree();
            groupRelationUi.expand();
            var relation = TestUtils.getChildWithLabel(
                groupRelationUi,
                "Possession of book 1"
            );
            expect(
                relation.isRelation()
            ).toBeTruthy();
            var identification = groupRelationUi.getModel().getIdentification();
            expect(
                relation.getModel().hasIdentification(
                    identification
                )
            ).toBeTruthy();
            TestUtils.startDragging(
                relation
            );
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            TestUtils.drop(otherBubble);
            relation = TestUtils.getChildWithLabel(
                otherBubble,
                "Possession of book 1"
            );
            expect(
                relation.isRelation()
            ).toBeTruthy();
            expect(
                relation.getModel().hasIdentification(
                    identification
                )
            ).toBeFalsy();
        });
        it("can change position of bubble under group relation", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var center = scenario.getCenterVertexInTree();
            var groupRelation = TestUtils.getChildWithLabel(
                center,
                "Possession"
            );
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            groupRelation.expand();
            var book2 = TestUtils.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            ).getTopMostChildBubble();
            expect(
                book2.getBubbleAbove().text()
            ).toBe("book 1");
            var book3 = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 3"
            ).getTopMostChildBubble();
            TestUtils.moveAbove(
                book3,
                book2
            );
            expect(
                book2.getBubbleAbove().text()
            ).toBe("book 3");
        });
        it("can change position of bubble under group relation even if relations are hidden for having the same label as the group relation", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var center = scenario.getCenterVertexInTree();
            var groupRelation = TestUtils.getChildWithLabel(
                center,
                "Possession"
            );
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            groupRelation.expand();
            var book2Relation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            );
            book2Relation.setText("Possession");
            book2Relation.getLabel().blur();
            expect(
                book2Relation.getHtml()
            ).toHaveClass("same-as-group-relation");
            var book2 = book2Relation.getTopMostChildBubble();
            expect(
                book2.getBubbleAbove().text()
            ).toBe("book 1");
            var book1Relation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            book1Relation.setText("Possession");
            book1Relation.getLabel().blur();
            expect(
                book1Relation.getHtml()
            ).toHaveClass("same-as-group-relation");
            var book1 = book1Relation.getTopMostChildBubble();
            TestUtils.moveAbove(
                book2,
                book1
            );
            expect(
                book2.getBubbleAbove().text()
            ).not.toBe("book 1");
        });
        it("can move a vertex above a group relation", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            TestUtils.moveAbove(
                otherBubble,
                groupRelation
            );
            var grandParent = otherBubble.getParentBubble().getParentBubble();
            expect(
                grandParent.isSameUri(
                    scenario.getCenterVertexInTree()
                )
            ).toBeTruthy();
        });
        it("send the original suggestion label to the server when accepting a suggestion by changing label", function () {
            MindMapInfo._setIsViewOnly(false);
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphUiBuilder.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var hasCalledService = false;
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            var suggestionLabel = vertexSuggestionInTree.getModel().getLabel();
            spyOn(SuggestionService, "accept").and.callFake(function (suggestionUi) {
                hasCalledService = true;
                expect(
                    suggestionUi.getSuggestion().getLabel()
                ).toBe(suggestionLabel);
                var deferred = $.Deferred();
                return deferred.resolve({
                    vertex_uri: TestUtils.generateVertexUri(),
                    edge_uri: TestUtils.generateEdgeUri()
                });
            });
            vertexSuggestionInTree.setText("potatoe");
            vertexSuggestionInTree.getLabel().blur();
            expect(
                hasCalledService
            ).toBeTruthy();
        });
        it("updates the selection to the new vertex when accepting suggestion from label update", function () {
            MindMapInfo._setIsViewOnly(false);
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphUiBuilder.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            SuggestionServiceMock.accept();
            vertexSuggestionInTree.setText("potatoe");
            vertexSuggestionInTree.getLabel().blur();
            expect(
                SelectionHandler.getSingleElement().isVertex()
            ).toBeTruthy();
        });
        it("updates the selection to the new relation when accepting suggestion from label update", function () {
            MindMapInfo._setIsViewOnly(false);
            SelectionHandler.removeAll();
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphUiBuilder.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var relationSuggestionInTree = eventBubble.getTopMostChildBubble();
            SuggestionServiceMock.accept();
            relationSuggestionInTree.setText("potatoe");
            relationSuggestionInTree.getLabel().blur();
            expect(
                SelectionHandler.getSingleElement().isRelation()
            ).toBeTruthy();
        });
        it("leaves edit mode when label was not changed", function () {
            MindMapInfo._setIsViewOnly(false);
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            b1.focus();
            expect(
                b1.isInEditMode()
            ).toBeTruthy();
            b1.getLabel().blur();
            expect(
                b1.isInEditMode()
            ).toBeFalsy();
        });
        describe("completeBuild", function(){
            it("shows link the button of other instances", function(){
                loadFixtures("graph-element-menu.html");
                var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
                var b1 = graphWithCircularityScenario.getBubble1InTree();
                var b2 = TestUtils.getChildWithLabel(
                    b1,
                    "r1"
                ).getTopMostChildBubble();
                var bubble3 = TestUtils.getChildWithLabel(
                    b1,
                    "r3"
                ).getTopMostChildBubble();
                expect(
                    b2._getInLabelButtonWithAction("visitOtherInstances").hasClass("hidden")
                ).toBeTruthy();
                graphWithCircularityScenario.expandBubble3(bubble3);
                expect(
                    b2._getInLabelButtonWithAction("visitOtherInstances").hasClass("hidden")
                ).toBeFalsy();
            });
        });
    });
});