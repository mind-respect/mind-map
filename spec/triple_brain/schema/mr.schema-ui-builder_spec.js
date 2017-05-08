/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    'test/mock',
    "mr.schema-ui-builder",
    "triple_brain.graph_ui"
], function (Scenarios, Mock, SchemaUiBuilder, GraphUi) {
    "use strict";
    describe("schema-ui-builder", function () {
        var schema;
        beforeEach(function () {
            var scenario = new Scenarios.getKaraokeSchemaGraph();
            schema = scenario.getSchema();
            Mock.applyDefaultMocks();
        });
        it("can build from server facade", function(){
            var uiId = GraphUi.generateBubbleHtmlId();
            var schemaUi = new SchemaUiBuilder.SchemaUiBuilder().create(schema, uiId);
            expect(
                schemaUi.getId()
            ).toBe(uiId);
            expect(
                schemaUi.getUri()
            ).toBe(schemaUi.getUri());
        });
        it("if no uiId is specified it generates one", function(){
            var schemaUi = new SchemaUiBuilder.SchemaUiBuilder().create(schema);
            expect(
                schemaUi.getId()
            ).toBeDefined();
        });
    });
});