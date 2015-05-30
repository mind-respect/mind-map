/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/test-utils',
    'triple_brain.identification',
    'triple_brain.event_bus',
    'triple_brain.module.date_picker'
], function (Scenarios, TestUtils, Identification, EventBus) {
    "use strict";
    describe("module.date_picker", function () {
        it("applies date picker for some specific identifications", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var someIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "some identification"
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, someIdentification]
            );
            expect(isAppliedToBubble(
                bubble
            )).toBeFalsy();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, eventIdentification()]
            );
            expect(isAppliedToBubble(
                bubble
            )).toBeTruthy();
        });

        it("shows datepicker when clicking on label", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, eventIdentification()]
            );
            expect(
                isVisible(bubble)
            ).toBeFalsy();
            bubble.getLabel().click();
            expect(
                isVisible(bubble)
            ).toBeTruthy();
        });

        it("hides datepicker when bubble is deselected", function () {

        });

        function eventIdentification() {
            return Identification.withUriAndLabel(
                "//wikidata.org/wiki/Q1656682",
                "event"
            );
        }

        function isAppliedToBubble(bubble) {
            return getContainer(
                    bubble
                ).length > 0;
        }

        function isVisible(bubble) {
            return !getContainer(
                bubble
            ).hasClass("hidden");
        }

        function getContainer(bubble) {
            return bubble.getHtml().find(
                "> .datepicker"
            );
        }
    });
});