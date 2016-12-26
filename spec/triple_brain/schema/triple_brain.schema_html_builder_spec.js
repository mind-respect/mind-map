/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "triple_brain.schema_html_builder",
    "triple_brain.graph_ui"
], function (Scenarios, SchemaHtmlBuilder, GraphUi) {
    "use strict";
    describe("schema_html_builder", function () {
        var schema;
        beforeEach(function () {
            var scenario = new Scenarios.getKaraokeSchemaGraph();
            schema = scenario.getSchema();
        });
        it("can build from server facade", function(){
            var uiId = GraphUi.generateBubbleHtmlId();
            var schemaUi = SchemaHtmlBuilder.withServerFacade(
                schema
            ).create(uiId);
            expect(
                schemaUi.getId()
            ).toBe(uiId);
            expect(
                schemaUi.getUri()
            ).toBe(schemaUi.getUri());
        });
        it("if no uiId is specified it generates one", function(){
            var schemaUi = SchemaHtmlBuilder.withServerFacade(
                schema
            ).create();
            expect(
                schemaUi.getId()
            ).toBeDefined();
        });
    });
});