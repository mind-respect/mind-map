/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.date_picker == undefined) {
    (function($) {
        triple_brain.module.date_picker = {};

        triple_brain.bus.local.topics('/event/ui/graph/vertex/type/updated').subscribe(function(vertex, typeUri){
            if(typeUri == "http://rdf.freebase.com/rdf/type/datetime"){
//                vertex.label().attr('id',  vertex.id() + '_label');
//                new JsDatePick({
//                    useMode:2,
//                    target:vertex.label().attr('id')
//                });
            }
        });
    })(jQuery);
}