/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.suggestion",
    "test/webapp/js/test-scenarios"
], function (Suggestion, Scenarios) {
    "use strict";
    describe("suggestion", function () {
        var karaokeSchemaScenario;
        beforeEach(function () {
            karaokeSchemaScenario = new Scenarios.getKaraokeSchemaGraph();
        });
        it("can build from schema property and origin uri", function () {
            var suggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            expect(
                suggestion.getLabel()
            ).toBe(
                "location"
            );
            expect(
                suggestion.getSameAs().getLabel()
            ).toBe(
                ""
            );
            expect(
                suggestion.getType().getLabel()
            ).toBe(
                "Location"
            );
            expect(
                suggestion.getOrigin().getOrigin()
            ).toBe(
                "identification_" + karaokeSchemaScenario.getSchema().getUri()
            );
        });
    });
});