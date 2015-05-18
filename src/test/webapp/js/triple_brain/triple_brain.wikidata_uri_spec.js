/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.wikidata_uri"
], function (WikidataUri) {
    "use strict";
    describe("wikidata_uri", function () {
        it("can return thumb uri of image name with spaces", function () {
            expect(WikidataUri.thumbUrlForImageId(
                "President Barack Obama.jpg"
            )).toBe(
                "//upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/60px-President_Barack_Obama.jpg"
            );
        });
        it("can return thumb uri of image name with parenthesis and accents", function () {
            expect(WikidataUri.thumbUrlForImageId(
                "Old Port of Montreal (French- Vieux-Port de Montréal).jpg"
            )).toBe(
                "//upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Old_Port_of_Montreal_%28French-_Vieux-Port_de_Montr%C3%A9al%29.jpg/60px-Old_Port_of_Montreal_%28French-_Vieux-Port_de_Montr%C3%A9al%29.jpg"
            );
        });
    });
});