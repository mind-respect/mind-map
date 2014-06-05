/**
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.event_bus",
        "jquery-ui"
    ],
    function ($, EventBus) {
        "use strict";
        EventBus.subscribe(
                '/event/ui/graph/vertex/type/added ' +
                '/event/ui/graph/vertex/same_as/added ' +
                '/event/ui/graph/vertex/generic_identification/added',
                handleIdentificationAdded
        );
        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            handleVertexCreated
        );
        return {};
        function handleIdentificationAdded(event, vertex, identification) {
            if (isIdentificationADate(identification)) {
                applyDatePickerToVertex(vertex);
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
        function applyDatePickerToVertex(vertex) {
            vertex.getLabel().datepicker()
        }

        function isIdentificationADate(identification) {
            return identification.uri() == "http://rdf.freebase.com/rdf/type/datetime"
        }
    }
);
