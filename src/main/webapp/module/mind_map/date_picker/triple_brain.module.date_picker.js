/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.event_bus",
        "jquery-ui"
    ],
    function ($, EventBus) {
        "use strict";
        EventBus.subscribe(
                "/event/ui/graph/identification/added",
                handleIdentificationAdded
        );
        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            handleVertexCreated
        );
        return {};
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
        function applyDatePickerToVertex(graphlement) {
            graphlement.getLabel().datepicker()
        }

        function isIdentificationADate(identification) {
            return identification.getExternalResourceUri() === "http://rdf.freebase.com/rdf/type/datetime";
        }
    }
);
