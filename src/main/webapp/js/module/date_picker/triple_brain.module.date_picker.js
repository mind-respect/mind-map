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
                "//wikidata.org/wiki/Q1656682",
                "/service/users/4x9zpdzn8n/graph/vertex/333628d9-32ba-4581-b6bc-9c4e66b6306b"
            ],
            _bubblesWithDatePicker = [];

        var api = {};
        EventBus.subscribe(
            "/event/ui/graph/identification/added",
            handleIdentificationAdded
        );
        EventBus.subscribe(
            '/event/ui/vertex/build_complete',
            handleVertexCreated
        );
        EventBus.subscribe(
            "/event/ui/selection/changed",
            function () {
                $.each(_bubblesWithDatePicker, function () {
                    var bubble = this;
                    if(bubble.isSelected()){
                        return;
                    }
                    hideDatePicker(bubble);
                });
            });
        return api;
        function handleIdentificationAdded(event, graphlement, identification) {
            if (isIdentificationADate(identification)) {
                applyDatePickerToVertex(graphlement);
            }
        }

        function handleVertexCreated(event, vertex) {
            $.each(vertex.getIdentifications(), function () {
                var identification = this;
                if (isIdentificationADate(identification)) {
                    applyDatePickerToVertex(vertex);
                    return false;
                }
            });
        }

        function applyDatePickerToVertex(graphElement) {
            var html = graphElement.getHtml();
            _bubblesWithDatePicker.push(
                graphElement
            );
            html.datepicker({
                container: "body",
                autoclose: false
            }).on("changeDate", function (event) {
                var bubble = BubbleFactory.fromSubHtml(
                    $(this)
                );
                bubble.getLabel().focus().text(event.date.toLocaleDateString()).blur();
                hideDatePicker(bubble);
            });
            hideDatePicker(graphElement);
            graphElement.getLabel().click(function () {
                showDatePicker(
                    BubbleFactory.fromSubHtml(
                        $(this)
                    )
                );
            });
        }

        function hideDatePicker(graphElement) {
            graphElement.getHtml().find(
                "> .datepicker"
            ).addClass("hidden");
        }

        function showDatePicker(graphElement) {
            graphElement.getHtml().datepicker(
                "show"
            );
            graphElement.getHtml().find(
                "> .datepicker"
            ).removeClass("hidden");
        }

        function isIdentificationADate(identification) {
            return urisToApply.indexOf(
                    identification.getExternalResourceUri()
                ) !== -1;
        }
    }
)
;
