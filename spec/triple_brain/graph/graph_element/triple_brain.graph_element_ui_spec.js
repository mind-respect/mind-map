/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.graph_service_mock",
    "test/mock/triple_brain.graph_element_service_mock",
    "test/mock/triple_brain.suggestion_service_mock",
    "test/mock/triple_brain.edge_service_mock",
    "test/mock/triple_brain.vertex_service_mock",
    "triple_brain.link_to_far_vertex_menu",
    "triple_brain.identification",
    "triple_brain.graph_element_service",
    "triple_brain.sub_graph",
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, GraphServiceMock, GraphElementServiceMock, SuggestionServiceMock, EdgeServiceMock, VertexServiceMock, LinkToFarVertexMenu, Identification, GraphElementService, SubGraph, GraphDisplayerAsRelativeTree, MindMapInfo) {
    "use strict";
    describe("graph_element_ui", function () {
        var vertex, schema;
        beforeEach(function () {
            vertex = new Scenarios.threeBubblesGraph().getBubble1Ui();
            schema = new Scenarios.getKaraokeSchemaGraph().getSchemaUi();
        });
        it("can tell the difference between vertex and schema", function () {
            expect(
                vertex.isVertex()
            ).toBeTruthy();
            expect(
                vertex.isSchema()
            ).toBeFalsy();
            expect(
                schema.isVertex()
            ).toBeFalsy();
            expect(
                schema.isSchema()
            ).toBeTruthy();
        });
        it("adds the same identification to other instances of the element", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
            var karaokeIdentification = Identification.fromFriendlyResource(
                new Scenarios.getKaraokeSchemaGraph().getSchema()
            );
            expect(
                bubble1Duplicate.getModel().hasIdentifications()
            ).toBeFalsy();
            karaokeIdentification.setType("generic");
            GraphElementServiceMock.addIdentification();
            bubble1.getController().addIdentification(
                karaokeIdentification
            );
            expect(
                bubble1Duplicate.getModel().hasIdentifications()
            ).toBeTruthy();
        });
        it("is no longer draggable when in edit mode", function () {
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble2 = threeBubblesGraph.getBubble2InTree();
            expect(
                bubble2.getHtml()
            ).toHaveAttr("draggable");
            bubble2.editMode();
            expect(
                bubble2.getHtml()
            ).not.toHaveAttr("draggable");
        });
        it("is draggable again when leaving edit mode", function () {
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble2 = threeBubblesGraph.getBubble2InTree();
            bubble2.editMode();
            expect(
                bubble2.getHtml()
            ).not.toHaveAttr("draggable");
            bubble2.leaveEditMode();
            expect(
                bubble2.getHtml()
            ).toHaveAttr("draggable");
        });
        // it("non draggable elements are not made draggable after leaving edit mode", function () {
        //     var threeBubblesGraph = new Scenarios.threeBubblesGraph();
        //     var aRelation = threeBubblesGraph.getBubble1InTree().getTopMostChildBubble();
        //     expect(
        //         aRelation.getHtml()
        //     ).not.toHaveAttr("draggable");
        //     aRelation.editMode();
        //     expect(
        //         aRelation.getHtml()
        //     ).not.toHaveAttr("draggable");
        //     aRelation.leaveEditMode();
        //     expect(
        //         aRelation.getHtml()
        //     ).not.toHaveAttr("draggable");
        // });
        it("prevents iframe injection", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setText("<iframe></iframe>");
            expect(
                bubble1.getLabel().html()
            ).toBe("");
        });
        it("prevents script injection", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setText("<script>alert('yo')</script>");
            expect(
                bubble1.getLabel().html()
            ).toBe("");
        });

        xit("changes label of duplicate relations", function () {
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
                impact3InTheIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
                impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();

            impact3InTheIndividualContext.focus();
            impact3InTheIndividualContext.getLabel().append(" new text");
            impact3InTheIndividualContext.getLabel().blur();
            expect(
                impact3InTheIndividualContext.text()
            ).toBe(
                "impact 3 new text"
            );
            expect(
                impact3InSocietyContext.text()
            ).toBe(
                "impact 3 new text"
            );
        });
        it("changes label of duplicate vertices", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
            bubble1.focus();
            bubble1.getLabel().append(" new text");
            bubble1.getLabel().blur();
            expect(
                bubble1.text()
            ).toBe(
                "b1 new text"
            );
            expect(
                bubble1Duplicate.text()
            ).toBe(
                "b1 new text"
            );
        });
        it("comparing label sets html markup", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.getModel().addGenericIdentification(
                Identification.fromFriendlyResource(
                    bubble1.getModel()
                )
            );
            bubble1.setText("banana");
            bubble1.getModel().setLabel("banana");
            expect(
                bubble1.getLabel()
            ).not.toContainElement(
                "del"
            );
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    scenario.getGraph()
                )
            );
            expect(
                bubble1.getLabel()
            ).toContainElement(
                "del"
            );
        });
        it("re-compares label after label change in comparison mode", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.getModel().addGenericIdentification(
                Identification.fromFriendlyResource(
                    bubble1.getModel()
                )
            );
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    scenario.getGraph()
                )
            );
            expect(
                bubble1.getLabel()
            ).not.toContainElement(
                "del"
            );
            bubble1.setText("banana");
            bubble1.getLabel().blur();
            expect(
                bubble1.getLabel()
            ).toContainElement(
                "del"
            );
        });
        it("does not compare label when changing text when a comparison suggestion to remove", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var destinationVertex = TestUtils.generateVertex();
            destinationVertex.setLabel("new vertex");
            var edge = TestUtils.generateEdge(
                b1Fork.getUri(),
                destinationVertex.getUri()
            );
            edge.setLabel("new relation");
            GraphDisplayerAsRelativeTree.addEdgeAndVertex(
                b1Fork,
                edge,
                destinationVertex
            );
            var newRelation = TestUtils.getChildWithLabel(
                b1Fork,
                "new relation"
            );
            expect(
                newRelation.isAComparisonSuggestionToRemove()
            ).toBeFalsy();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            newRelation = TestUtils.getChildWithLabel(
                b1Fork,
                "new relation"
            );
            expect(
                newRelation.isAComparisonSuggestionToRemove()
            ).toBeTruthy();
            newRelation.setText("banana");
            newRelation.getLabel().blur();
            expect(
                newRelation.getLabel()
            ).not.toContainElement(
                "del"
            );
        });
        it("updates input label if model text is different than input text in label update", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            b1.getModel().setLabel("pine apple");
            expect(
                b1.getLabel().text()
            ).not.toBe("pine apple");
            b1.labelUpdateHandle();
            expect(
                b1.getLabel().text()
            ).toBe("pine apple");
        });
        it("can update model suggestion label in comparison mode", function () {
            var suggestionUi = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            SuggestionServiceMock.accept();
            suggestionUi.setText("something");
            suggestionUi.getLabel().blur();
            expect(
                suggestionUi.text()
            ).toBe("something");
        });
    });
    // it("sets the right number of other instances to far vertex added to a new vertex", function () {
    //     var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
    //     MindMapInfo._setIsViewOnly(false);
    //     VertexServiceMock.addRelationAndVertexToVertexMock();
    //     b1.getController().addChild();
    //     var newVertex = TestUtils.getChildWithLabel(
    //         b1,
    //         ""
    //     ).getTopMostChildBubble();
    //     var otherGraphScenario = new Scenarios.graphWithHiddenSimilarRelations();
    //     GraphServiceMock.getForCentralVertexUri(
    //         otherGraphScenario.getGraph()
    //     );
    //     EdgeServiceMock.addToFarVertex();
    //     LinkToFarVertexMenu.ofVertex(newVertex).create()._selectElementWithUri(
    //         otherGraphScenario.getCenterBubbleUri()
    //     );
    //     var otherGraphCenterBubble = newVertex.getTopMostChildBubble().getTopMostChildBubble();
    //     expect(
    //         otherGraphCenterBubble.hasOtherInstances()
    //     ).toBeFalsy();
    // });
    
});