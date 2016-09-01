/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.suggestion_service_mock",
    "triple_brain.suggestion_service",
    "triple_brain.graph_element_ui",
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.selection_handler",
    "triple_brain.event_bus",
    "triple_brain.sub_graph",
    "triple_brain.graph_service",
    "test/mock/triple_brain.graph_service_mock"
], function (Scenarios, TestUtils, SuggestionServiceMock, SuggestionService, GraphElementUi, GraphDisplayerAsRelativeTree, SelectionHandler, EventBus, SubGraph, GraphService, GraphServiceMock) {
    "use strict";
    describe("suggestion_bubble_ui", function () {
        var oneSuggestionScenario;
        beforeEach(function () {
            oneSuggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
        });
        //todo
        it("does not update the label of other bubbles on the map that are the same suggestion", function () {
            // Mock.mockAcceptSuggestion();
            // var suggestion = oneSuggestionScenario.getAnySuggestionInTree(),
            //     sameSuggestion = oneSuggestionScenario.getAnySuggestionInTree();
            // suggestion.getLabel().text("test").blur();
            // expect(
            //     suggestion.text()
            // ).toBe("test");
            // expect(
            //     sameSuggestion.text()
            // ).not.toBe("test");
        });
        it("can remove newly accepted suggestion", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
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
            vertexSuggestionInTree.whenItIntegrates().then(function () {
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
            vertexSuggestionInTree.whenItIntegrates().then(function (newVertex) {
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

        it("publishes throught event bus that the vertex build is completed after integration", function () {
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            var hasCompletedBuild = false;
            EventBus.subscribe('/event/ui/vertex/build_complete', function () {
                hasCompletedBuild = true;
            });
            vertexSuggestionInTree.integrate();
            expect(
                hasCompletedBuild
            ).toBeTruthy();
        });
        it("can handle label update when it has no type", function () {
            var vertexSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            vertexSuggestionInTree.getSuggestion()._setType(undefined);
            SuggestionServiceMock.accept();
            vertexSuggestionInTree.setText("bingo");
            vertexSuggestionInTree.getLabel().blur();
            expect(
                vertexSuggestionInTree.getModel().getLabel()
            ).toBe(
                "bingo"
            );
        });
        it("compares suggestion text after it's integrated", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            r2.remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.isAComparisonSuggestionToAdd()
            ).toBeTruthy();
            expect(
                b3.text()
            ).not.toBe("banana");
            b3.getLabel().text("banana").blur();
            b3.integrate();
            b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.isAComparisonSuggestionToAdd()
            ).toBeFalsy();
            expect(
                b3.getLabel().find("del").length
            ).toBeGreaterThan(0);
        });
        it("keeps user entered text after integrating a suggestion having comparison for origin", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            r2.remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.isAComparisonSuggestionToAdd()
            ).toBeTruthy();
            expect(
                b3.text()
            ).not.toBe("banana");
            b3.getLabel().text("banana").blur();
            b3.integrate();
            b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.isAComparisonSuggestionToAdd()
            ).toBeFalsy();
            expect(
                b3.getLabel().find("del").text()
            ).toBe("anana");
        });
        it("fetches children of type external uri when adding child tree of a suggestion", function () {
            var calledUri;
            spyOn(
                GraphService,
                "getForCentralBubbleUri"
            ).and.callFake(function (uri) {
                calledUri = uri;
            });
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            var b3 = r2.getTopMostChildBubble();
            var b3ComparedWithUri = b3.getFirstIdentificationToAGraphElement().getExternalResourceUri();
            r2.remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                calledUri
            ).not.toBe(b3ComparedWithUri);
            b3.getController().expand();
            expect(
                calledUri
            ).toBe(b3ComparedWithUri);
        });

        it("can expand a suggestion children", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            GraphServiceMock.getForCentralBubbleUri(
                new Scenarios.threeBubblesGraph().getSubGraphForB3()
            );
            b3.getController().expand();
            expect(
                b3.getNumberOfChild()
            ).toBe(2);
        });

        it("makes expanded suggestion children as suggestions too", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            GraphServiceMock.getForCentralBubbleUri(
                new Scenarios.threeBubblesGraph().getSubGraphForB3()
            );
            b3.getController().expand();
            var suggestionChild = b3.getTopMostChildBubble();
            expect(
                suggestionChild.isRelationSuggestion()
            ).toBeTruthy();
        });

        it("sets the label to expanded suggestions vertex", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            GraphServiceMock.getForCentralBubbleUri(
                new Scenarios.threeBubblesGraph().getSubGraphForB3()
            );
            b3.getController().expand();
            var b5 = TestUtils.getChildWithLabel(
                b3,
                "r4"
            ).getTopMostChildBubble();
            expect(
                b5.text()
            ).toBe("b5");
        });

        it("removes the hidden child flag after it expands", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            expect(
                b3.hasVisibleHiddenRelationsContainer()
            ).toBeTruthy();
            GraphServiceMock.getForCentralBubbleUri(
                new Scenarios.threeBubblesGraph().getSubGraphForB3()
            );
            b3.getController().expand();
            expect(
                b3.hasVisibleHiddenRelationsContainer()
            ).toBeFalsy();
        });
        it("shows the hidden child flag of expanded suggestions if applicable", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var b3 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).getTopMostChildBubble();
            GraphServiceMock.getForCentralBubbleUri(
                new Scenarios.threeBubblesGraph().getSubGraphForB3()
            );
            b3.getController().expand();
            var b5 = TestUtils.getChildWithLabel(
                b3,
                "r4"
            ).getTopMostChildBubble();
            expect(
                b5.hasHiddenRelationsContainer()
            ).toBeFalsy();
            var b4 = TestUtils.getChildWithLabel(
                b3,
                "r3"
            ).getTopMostChildBubble();
            expect(
                b4.hasHiddenRelationsContainer()
            ).toBeTruthy();
        });
        it("can be accessible by visiting all graph elements", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            var isIncluded = false;
            GraphElementUi.visitAll(function(element){
                if(element.getId() === vertexSuggestionInTree.getId()){
                    isIncluded = true;
                }
            });
            expect(
                isIncluded
            ).toBeTruthy();
        });
    });
});