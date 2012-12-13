/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.event_bus",
    "jquery",
    "jquery-ui"
],
    function(EventBus, $){
        var api = {};
        EventBus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function(event, vertex, type){
                if(isIdentificationADate(type)){
                    applyDatePickerToVertex(vertex);
                }
            }
        );
        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function(event, vertex){
                $.each(vertex.getIdentifications(), function(){
                    var identification = this;
                    if(isIdentificationADate(identification)){
                        applyDatePickerToVertex(vertex);
                    }
                    return false;
                });
            }
        );
        function applyDatePickerToVertex(vertex){
            $(vertex.label()).datepicker()
        }
        function isIdentificationADate(identification){
            return identification.uri() == "http://rdf.freebase.com/rdf/type/datetime"
        }
        return api;

    }
);
