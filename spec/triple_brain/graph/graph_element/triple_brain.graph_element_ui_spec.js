/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.identification",
    "triple_brain.graph_element_service"
], function (Scenarios, TestUtils, Identification, GraphElementService) {
    "use strict";
    describe("graph_element_ui", function () {
        var vertex, schema;
        beforeEach(function () {
            vertex = new Scenarios.threeBubblesGraph().getBubble1Ui();
            schema = new Scenarios.getKaraokeSchemaGraph().getSchemaUi();
        });
        it("can tell the difference between vertex and schema", function(){
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
        it("adds the same identification to other instances of the element", function(){
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
            var karaokeIdentification = Identification.fromFriendlyResource(
                new Scenarios.getKaraokeSchemaGraph().getSchema()
            );
            expect(
                bubble1Duplicate.hasIdentifications()
            ).toBeFalsy();
            karaokeIdentification.setType("generic");
            GraphElementService._addIdentificationsCallback(
                bubble1,
                karaokeIdentification,
                TestUtils.singleIdentificationToMultiple(karaokeIdentification)
            );
            expect(
                bubble1Duplicate.hasIdentifications()
            ).toBeTruthy();
        });
        it("adds the identification to self if added identification external uri is self uri", function(){
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble2 = threeBubblesGraph.getBubble2InTree();
            expect(
                bubble2.hasIdentifications()
            ).toBeFalsy();
            var bubble2AsAnIdentification = Identification.fromFriendlyResource(
                bubble2.getOriginalServerObject()
            );
            bubble2AsAnIdentification.setType("generic");
            GraphElementService._addIdentificationsCallback(
                threeBubblesGraph.getBubble3InTree(),
                bubble2AsAnIdentification,
                TestUtils.singleIdentificationToMultiple(bubble2AsAnIdentification)
            );
            expect(
                bubble2.hasIdentifications()
            ).toBeTruthy();
        });
        it("is no longer draggable when in edit mode", function(){
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
        it("is draggable again when leaving edit mode", function(){
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
        it("non draggable elements are not made draggable after leaving edit mode", function(){
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var aRelation =  threeBubblesGraph.getBubble1InTree().getTopMostChildBubble();
            expect(
                aRelation.getHtml()
            ).not.toHaveAttr("draggable");
            aRelation.editMode();
            expect(
                aRelation.getHtml()
            ).not.toHaveAttr("draggable");
            aRelation.leaveEditMode();
            expect(
                aRelation.getHtml()
            ).not.toHaveAttr("draggable");
        });
    });
});