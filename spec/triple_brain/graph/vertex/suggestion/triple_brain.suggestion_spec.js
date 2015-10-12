/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.suggestion",
    "test/test-scenarios"
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
        it('takes the property identification to set as the suggestion type', function () {
            var locationProperty = karaokeSchemaScenario.getLocationProperty();
            var locationSuggestion = Suggestion.fromSchemaPropertyAndOriginUri(
                locationProperty,
                karaokeSchemaScenario.getSchema().getUri()
            );
            var locationIdentification = locationProperty.getIdentifications()[0];
            expect(
                locationSuggestion.getType().getUri()
            ).toBe(
                locationIdentification.getExternalResourceUri()
            );
        });
        it('the property identification description is set to the suggestion type', function () {
            var locationProperty = karaokeSchemaScenario.getLocationProperty();
            var locationSuggestion = Suggestion.fromSchemaPropertyAndOriginUri(
                locationProperty,
                karaokeSchemaScenario.getSchema().getUri()
            );
            expect(
                locationSuggestion.getType().getComment()
            ).toBe(
                "The Location type is used for any topic with a fixed location on the planet Earth. It includes geographic features such as oceans and mountains, political entities like cities and man-made objects like buildings.Guidelines for filling in location properties:geolocation: the longitude and latitude (in decimal notation) of the feature, or of the geographical center (centroid) fo the feature.contains and contained by: these properties can be used to show spatial relationships between different locations, such as an island contained by a body of water (which is equivalent to saying the body of water contains the island), a state contained by a country, a mountain within the borders of a national park, etc. For geopolitical locations,   containment two levels up and down is the ideal minimum. For example, the next two levels up for the city of Detroit are Wayne County and the state of Michigan.adjoins: also used to show spatial relations, in this case between locations that share a border.USBG Name: A unique name given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. More information can be found on their website. GNIS ID: A unique id given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. GNIS stands for Geographic Names Information System. More information can be found on their website.GEOnet Feature ID: The UFI (Unique Feature ID) used by GeoNet for features outside of the United States. More information can be found on their website."
            );
        });
    });
});