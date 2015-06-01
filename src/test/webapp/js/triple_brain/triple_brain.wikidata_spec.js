/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'jquery',
    'test/webapp/js/test-scenarios',
    'test/webapp/js/test-utils',
    "triple_brain.wikidata",
    "triple_brain.identification"
], function ($, Scenarios, TestUtils, Wikidata, Identification) {
    "use strict";
    describe("wikidata", function () {
        it("verifies that the identification is related to wikidata before fetching image for it", function () {
            var getImageSpy = spyOn(
                Wikidata,
                "getImageForWikidataUri"
            ).and.callFake(function(){
                    var deferred = $.Deferred();
                    deferred.resolve();
                    return deferred.promise();
                });
            var wikidataIdentification = Identification.withUriAndLabel(
                "//www.wikidata.org/wiki/Q937",
                "Albert Einstein"
            );
            expect(
                getImageSpy.calls.count()
            ).toBe(0);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            Wikidata._beforeIdentificationAdded(
                bubble1,
                wikidataIdentification
            );
            expect(
                getImageSpy.calls.count()
            ).toBe(1);
            var nonWikidataIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "something that is not from wikidata"
            );
            Wikidata._beforeIdentificationAdded(
                bubble1,
                nonWikidataIdentification
            );
            expect(
                getImageSpy.calls.count()
            ).toBe(1);
        });
    });
});