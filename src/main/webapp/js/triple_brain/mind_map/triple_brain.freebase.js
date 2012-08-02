if (triple_brain.freebase == undefined) {
    (function ($) {
        var eventBus = triple_brain.event_bus;
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
        freebaseStatic.isFreebaseUri = function (uri) {
            return $.url(uri).attr()
                .host
                .toLowerCase()
                .indexOf("freebase.com") != -1;
        }
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
                    triple_brain.vertex.setSuggestions(
                        vertex,
                        suggestions
                    );
                })
        }
        eventBus.subscribe(
            '/event/ui/graph/vertex/type/updated',
            function (event, vertex) {
                var typeUri = vertex.type().uri();
                if (!freebaseStatic.isFreebaseUri(typeUri)) {
                    return;
                }
                var typeId = freebaseStatic.idInFreebaseURI(typeUri);
                freebaseStatic.listPropertiesOfFreebaseTypeId(
                    vertex,
                    typeId
                );
                $(vertex.label()).suggest({
                    "zIndex":20,
                    "type":typeId
                })
                    .bind("fb-select", function (e, data) {
                        vertex.readjustLabelWidth();
                        triple_brain.vertex.updateLabel(vertex, vertex.text());
                        var resourceUri = freebaseStatic.freebaseIdToURI(data.id);
                        triple_brain.vertex.updateSameAs(vertex, resourceUri);
                    });
            }
        );
    })(jQuery);

}