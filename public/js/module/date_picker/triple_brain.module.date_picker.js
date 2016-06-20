/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.bubble_factory",
        "bootstrap-datepicker"
    ],
    function ($, EventBus, BubbleFactory) {
        "use strict";
        var urisToApply = [
            "http://rdf.freebase.com/rdf/type/datetime",
            "//www.wikidata.org/wiki/Q205892"
        ];
        var api = {};
        api._handleFocus = function () {
            showDatePicker(
                BubbleFactory.fromSubHtml(
                    $(this)
                )
            );
        };

        EventBus.subscribe(
            "/event/ui/graph/identification/added",
            handleIdentificationAdded
        );
        EventBus.subscribe(
            '/event/ui/vertex/build_complete',
            handleVertexCreated
        );
        EventBus.subscribe(
            'suggestion_ui_shown',
            handleSuggestionShown
        );

        return api;
        function handleIdentificationAdded(event, graphlement, identification) {
            if (isIdentificationADate(identification)) {
                applyDatePickerToVertex(graphlement);
            }
        }

        function handleVertexCreated(event, vertex) {
            if (isAppliedToBubble(vertex)) {
                return;
            }
            $.each(vertex.getIdentifications(), function () {
                var identification = this;
                if (isIdentificationADate(identification)) {
                    applyDatePickerToVertex(vertex);
                    return false;
                }
            });
        }

        function handleSuggestionShown(event, suggestion) {
            var isSameAsADate = isIdentificationADate(
                suggestion.getSuggestion().getSameAs()
            );
            var isTypeADate = suggestion.getSuggestion().hasType() && isIdentificationADate(
                    suggestion.getSuggestion().getType()
                );
            if (isSameAsADate || isTypeADate) {
                applyDatePickerToVertex(suggestion);
            }
        }

        function applyDatePickerToVertex(graphElement) {
            var html = graphElement.getHtml();
            html.datepicker({
                container: "body",
                autoclose: false
            });
            var date = isTextADate(
                graphElement.text()
            ) ?
                graphElement.text() :
                new Date();
            html.datepicker(
                "setDate",
                date
            );
            html.on("changeDate", function (event) {
                var bubble = BubbleFactory.fromSubHtml(
                    $(this)
                );
                var dateString = event.date.toISOString().substring(
                    0, 10
                );
                var bubbleText = bubble.text();
                var isBubbleTextADate = isTextADate(
                    bubbleText
                );
                if (isBubbleTextADate || bubbleText === "") {
                    bubbleText = dateString;
                } else {
                    bubbleText += " " + dateString;
                }
                bubble.getLabel().off(
                    "focus", api._handleFocus
                ).off(
                    "blur", handleBlur
                ).focus().text(
                    bubbleText
                ).blur().on(
                    "focus", api._handleFocus
                ).on(
                    "blur", handleBlur
                );
                hideDatePicker(bubble);
            });
            getDatePickerContainer(
                graphElement
            ).on("mousedown", function () {
                    var bubble = BubbleFactory.fromSubHtml(
                        $(this)
                    );
                    bubble.getHtml().data(
                        "module.date_picker.has_clicked",
                        true
                    );
                });
            hideDatePicker(graphElement);
            graphElement.getLabel().on(
                "focus",
                api._handleFocus
            ).on(
                "blur",
                handleBlur
            );
        }

        function hideDatePicker(graphElement) {
            getDatePickerContainer(
                graphElement
            ).addClass("hidden");
        }

        function showDatePicker(graphElement) {
            graphElement.getHtml().datepicker(
                "show"
            );
            getDatePickerContainer(
                graphElement
            ).removeClass("hidden");
        }

        function isIdentificationADate(identification) {
            return urisToApply.indexOf(
                    identification.getExternalResourceUri()
                ) !== -1;
        }

        function isAppliedToBubble(graphElement) {
            return getDatePickerContainer(
                    graphElement
                ).length > 0;
        }

        function getDatePickerContainer(graphElement) {
            return graphElement.getHtml().find(
                "> .datepicker"
            );
        }

        function handleBlur() {
            var bubble = BubbleFactory.fromSubHtml(
                $(this)
            );
            if (bubble.getHtml().data("module.date_picker.has_clicked")) {
                event.stopImmediatePropagation();
                bubble.getHtml().data(
                    "module.date_picker.has_clicked",
                    false
                );
                return;
            }
            hideDatePicker(
                bubble
            );
        }
        function isTextADate(text) {
            return !isNaN(
                Date.parse(
                    text
                )
            );
        }
    }
);
