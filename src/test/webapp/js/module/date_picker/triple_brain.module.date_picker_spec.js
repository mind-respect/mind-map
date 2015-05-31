/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/test-utils',
    'triple_brain.identification',
    'triple_brain.event_bus',
    'triple_brain.selection_handler',
    'triple_brain.module.date_picker'
], function (Scenarios, TestUtils, Identification, EventBus, SelectionHandler) {
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
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, eventIdentification()]
            );
            bubble.getLabel().click();
            expect(
                isVisible(bubble)
            ).toBeTruthy();
            SelectionHandler.removeAll();
            expect(
                isVisible(bubble)
            ).toBeFalsy();
        });

        it("parses the date of the bubble label to set it in the calendar", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble.setText("5/29/2013");
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, eventIdentification()]
            );
            var date = bubble.getHtml().datepicker("getDate");
            expect(
                date.getFullYear()
            ).toBe(2013);
            expect(
                date.getMonth()
            ).toBe(4);
            expect(
                date.getDate()
            ).toBe(29);
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