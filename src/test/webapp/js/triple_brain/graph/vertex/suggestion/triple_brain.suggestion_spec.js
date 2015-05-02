/*
 * Copyright Vincent Blouin under the GPL License version 3
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
        it('"same as" label is the property label', function () {
            var locationProperty = karaokeSchemaScenario.getLocationProperty(),
                suggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion();
            expect(
                locationProperty.getLabel()
            ).toBe("location");
            expect(
                suggestion.getSameAs().getLabel()
            ).toBe(
                locationProperty.getLabel()
            );
        });
        it('can tell if it has identification for origin', function () {
            var suggestion = karaokeSchemaScenario.getLocationPropertyAsSuggestion(),
                possessionIdentification = new Scenarios.GraphWithSimilarRelationsScenario().getPossession();
            expect(
                suggestion.hasIdentificationForOrigin(
                    possessionIdentification
                )
            ).toBeFalsy();
            expect(
                suggestion.hasIdentificationForOrigin(
                    karaokeSchemaScenario.getSchemaAsIdentification()
                )
            ).toBeTruthy();
        });
    });
});