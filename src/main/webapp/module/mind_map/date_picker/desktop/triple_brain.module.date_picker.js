/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.date_picker == undefined) {
    (function($) {
        triple_brain.module.date_picker = {};

        triple_brain.event_bus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function(event, vertex, type){
                if(type.uri() == "http://rdf.freebase.com/rdf/type/datetime"){
    //                vertex.label().attr('id',  vertex.getId() + '_label');
    //                new JsDatePick({
    //                    useMode:2,
    //                    target:vertex.label().attr('id')
    //                });
                }
            }
        );
    })(jQuery);
}