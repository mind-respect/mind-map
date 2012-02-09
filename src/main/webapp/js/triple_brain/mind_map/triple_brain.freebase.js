require("triple_brain")
if (triple_brain.freebase == undefined) {

    (function($) {
        triple_brain.freebase = {
             freebaseIdToURI: function(freebaseId) {
                return "http://rdf.freebase.com/rdf" + freebaseId;
             },
             idInFreebaseURI: function(freebaseURI){
                return freebaseURI.replace("http://rdf.freebase.com/rdf", "");
             },
             isOfTypeTypeFromTypeId: function(typeId){
                return typeId == "/type/type";
             },
             listPropertiesOfFreebaseTypeId: function(vertex, freebaseId){
                propertiesOfTypeQuery = {
                    query: {
                        id: freebaseId,
                        type: "/type/type",
                        properties: [{   id: null,
                                         name: null,
                                         expected_type:null
                                    }]
                    }
                };
                $.ajax({
                    type: 'GET',
                    url: 'https://api.freebase.com/api/service/mqlread?query=' + JSON.stringify(propertiesOfTypeQuery),
                    dataType: 'jsonp'
                }).success(function(result) {
                    var properties = [];
                    if(result.result){
                        properties = result.result.properties;
                    }
                    triple_brain.bus.local.topic('/event/ui/graph/vertex/type/properties/updated').publish(vertex, properties);
                })
             }
        }

    })(jQuery);

}