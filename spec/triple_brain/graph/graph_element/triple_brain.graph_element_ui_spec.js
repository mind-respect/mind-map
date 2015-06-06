/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "triple_brain.identification",
    "triple_brain.graph_element_service"
], function (Scenarios, Identification, GraphElementService) {
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
            GraphElementService._addIdentificationCallback(
                bubble1,
                karaokeIdentification,
                karaokeIdentification.getServerFormat()
            );
            expect(
                bubble1Duplicate.hasIdentifications()
            ).toBeTruthy();
        });
    });
});