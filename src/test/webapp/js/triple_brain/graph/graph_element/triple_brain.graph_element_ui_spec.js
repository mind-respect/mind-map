/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.bubble_factory",
    "test/webapp/js/test-scenarios"
], function (GraphElementUi, Scenarios) {
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
    });
});