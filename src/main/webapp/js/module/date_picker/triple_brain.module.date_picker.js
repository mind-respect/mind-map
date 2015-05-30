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
            "/service/users/xfco1gsr2b/graph/vertex/de6a691b-36ee-4481-a0a0-4995ce113f3f"
        ];

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

            }
        );
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
);
