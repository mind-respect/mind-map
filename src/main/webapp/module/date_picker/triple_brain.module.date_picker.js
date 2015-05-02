/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "bootstrap-datepicker"
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
            graphlement.getLabel().on(
                "click",
                function(){
                    $(this).closest(".bubble").datepicker({
                        container:"body"
                    }).on("changeDate", function(event){
                        event.date.toLocaleDateString();
                        console.log("fun");
                    });
                }
            );
        }

        function isIdentificationADate(identification) {
            return identification.getExternalResourceUri() === "http://rdf.freebase.com/rdf/type/datetime";
        }
    }
);
