/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/test-utils',
    'triple_brain.identification',
    'triple_brain.event_bus',
    'triple_brain.module.date_picker'
], function (Scenarios, TestUtils, Identification, EventBus, ModuleDatePicker) {
    "use strict";
    describe("module.date_picker", function () {
        it("applies date picker for some specific identifications", function(){
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var someIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "some identification"
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, someIdentification]
            );
            expect(ModuleDatePicker.isAppliedToBubble(
                bubble
            )).toBeFalsy();
            var eventIdentification = Identification.withUriAndLabel(
                "//wikidata.org/wiki/Q1656682",
                "event"
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, eventIdentification]
            );
            expect(ModuleDatePicker.isAppliedToBubble(
                bubble
            )).toBeTruthy();
        });
    });
});