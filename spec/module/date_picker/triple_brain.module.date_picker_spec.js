/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.identification',
    'triple_brain.event_bus',
    'triple_brain.selection_handler',
    'triple_brain.module.date_picker',
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, Mock, Identification, EventBus, SelectionHandler, ModuleDatePicker, MindMapInfo) {
    "use strict";
    describe("module.date_picker", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
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
                [bubble, dateIdentification()]
            );
            expect(isAppliedToBubble(
                bubble
            )).toBeTruthy();
        });

        it("shows datepicker when label is on focus", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
            );
            expect(
                isVisible(bubble)
            ).toBeFalsy();
            focus(bubble);
            expect(
                isVisible(bubble)
            ).toBeTruthy();
        });

        it("hides datepicker when bubble is blurred", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
            );
            focus(bubble);
            expect(
                isVisible(bubble)
            ).toBeTruthy();
            bubble.getLabel().blur();
            expect(
                isVisible(bubble)
            ).toBeFalsy();
        });

        it("parses the date of the bubble label to set it in the calendar", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble.setText("5/29/2013");
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
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

        it("it changes bubble text for new date if bubble has no text", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
            );
            bubble.setText("");
            expect(
                bubble.text()
            ).toBe("");
            bubble.getHtml().datepicker(
                "setUTCDates",
                new Date("2013/4/29")
            );
            expect(
                bubble.text() === ""
            ).toBeFalsy();
            var date = dateStrToDate(
                bubble.text()
            );
            expect(
                date.getDate()
            ).toBe(29);
            expect(
                date.getMonth()
            ).toBe(3);
            expect(
                date.getFullYear()
            ).toBe(2013);
        });

        it("it appends selected date to bubble text if bubble has text that isn't a date", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
            );
            bubble.setText("some text");
            expect(
                bubble.text()
            ).toBe("some text");
            bubble.getHtml().datepicker(
                "setUTCDates",
                new Date("2013/4/29")
            );
            expect(
                bubble.text().indexOf("some text ") === 0
            ).toBeTruthy();
            var date = dateStrToDate(
                bubble.text().substr(
                    "some text ".length
                )
            );
            expect(
                date.getDate()
            ).toBe(29);
            expect(
                date.getMonth()
            ).toBe(3);
            expect(
                date.getFullYear()
            ).toBe(2013);
        });

        it("it replaces bubble text with selected date if bubble has text that is a date", function () {
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [bubble, dateIdentification()]
            );
            bubble.setText("2012-11-15");
            bubble.getHtml().datepicker(
                "setUTCDates",
                new Date("2013/4/29")
            );
            var date = dateStrToDate(
                bubble.text()
            );
            expect(
                date.getDate()
            ).toBe(29);
            expect(
                date.getMonth()
            ).toBe(3);
            expect(
                date.getFullYear()
            ).toBe(2013);
        });
        it("can apply datepicker to a suggestion", function(){
            MindMapInfo._setIsViewOnly(false);
            var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            var personSuggestion = TestUtils.getChildWithLabel(
                eventBubble,
                "People involved"
            ).getTopMostChildBubble();
            expect(isAppliedToBubble(
                personSuggestion
            )).toBeFalsy();
            var dateSuggestion = TestUtils.getChildWithLabel(
                eventBubble,
                "Start date"
            ).getTopMostChildBubble();
            expect(isAppliedToBubble(
                dateSuggestion
            )).toBeTruthy();
        });
        it("wont fail if suggestion has no type", function(){
            MindMapInfo._setIsViewOnly(false);
            var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            var dateSuggestion = TestUtils.getChildWithLabel(
                eventBubble,
                "Start date"
            ).getTopMostChildBubble();
            expect(isAppliedToBubble(
                dateSuggestion
            )).toBeTruthy();
            dateSuggestion.getSuggestion()._setType(undefined);
            dateSuggestion.getHtml().datepicker("remove");
            expect(isAppliedToBubble(
                dateSuggestion
            )).toBeFalsy();
            EventBus.publish(
                "suggestion_ui_shown", dateSuggestion
            );
            expect(isAppliedToBubble(
                dateSuggestion
            )).toBeFalsy();
        });
        it("date on suggestion is correct", function(){
            MindMapInfo._setIsViewOnly(false);
            var suggestionUi = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            suggestionUi.getSuggestion()._setType(
                dateIdentification()
            );
            EventBus.publish(
                "suggestion_ui_shown", suggestionUi
            );
            suggestionUi.getHtml().datepicker(
                "setUTCDates",
                new Date("2013/4/29")
            );
            suggestionUi.integrate();
            var date = dateStrToDate(
                suggestionUi.text()
            );
            expect(
                date.getDate()
            ).toBe(29);
            expect(
                date.getMonth()
            ).toBe(3);
            expect(
                date.getFullYear()
            ).toBe(2013);
        });
        function dateIdentification() {
            return Identification.withUriAndLabel(
                "//www.wikidata.org/wiki/Q205892",
                "date"
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
        function focus(bubble){
            /*
                I should use bubble.getLabel().focus() to trigger the focus
                but I think its because of phantomjs, it doesnt trigger the focus!
                When phantomjs fixes it or I figure I was doing something wrong
                to refactor _handleFocus doesn't have to be exposed in ModuleDatePicker
             */
            ModuleDatePicker._handleFocus.call(
                bubble.getLabel()
            );
        }
        function dateStrToDate(dateStr){
            dateStr = dateStr.replace(
                new RegExp('-', 'g'), "/"
            );
            return new Date(
                dateStr
            );
        }
    });
});
