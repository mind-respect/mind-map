/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios'
], function (Scenarios) {
    "use strict";
    describe("schema", function () {
        it("is public", function () {
            var scenario = new Scenarios.getProjectSchema();
            expect(
                scenario.getSchemaInTree().getModel().isPublic()
            ).toBeTruthy();
        });
    });
});