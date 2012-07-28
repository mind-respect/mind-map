if (triple_brain.freebase == undefined) {
    var eventBus = triple_brain.event_bus;
    (function ($) {
        var freebaseStatic = triple_brain.freebase = {};
        freebaseStatic.freebaseIdToURI = function (freebaseId) {
            return "http://rdf.freebase.com/rdf" + freebaseId;
        };
        freebaseStatic.idInFreebaseURI = function (freebaseURI) {
            return freebaseURI.replace("http://rdf.freebase.com/rdf", "");
        };
        freebaseStatic.isOfTypeTypeFromTypeId = function (typeId) {
            return typeId == "/type/type";
        };
        freebaseStatic.listPropertiesOfFreebaseTypeId = function (vertex, freebaseId) {
            propertiesOfTypeQuery = {
                query:{
                    id:freebaseId,
                    type:"/type/type",
                    properties:[
                        {   id:null,
                            name:null,
                            expected_type:null
                        }
                    ]
                }
            };
            $.ajax({
                type:'GET',
                url:'https://api.freebase.com/api/service/mqlread?query=' + JSON.stringify(propertiesOfTypeQuery),
                dataType:'jsonp'
            }).success(function (result) {
                    var freebaseProperties = [];
                    if (result.result) {
                        freebaseProperties = result.result.properties;
                    }
                    var suggestions = [];
                    $.each(freebaseProperties, function () {
                        var freebaseProperty = this;
                        suggestions.push(
                            triple_brain.suggestion.fromFreebaseSuggestion(
                                freebaseProperty
                            )
                        )
                    })
                    triple_brain.vertex.setSuggestions(vertex, suggestions);
                })
        }


    })(jQuery);

}