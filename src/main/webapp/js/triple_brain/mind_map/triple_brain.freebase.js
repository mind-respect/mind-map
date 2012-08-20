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
        freebaseStatic.handleIdentificationToServer = function(vertex, freebaseSuggestion, successCallBack){
            var vertexService = triple_brain.vertex;
            var externalResourceStatic = triple_brain.external_resource;
            var typeId = freebaseSuggestion['n:type'].id;
            var externalResource = externalResourceStatic.fromFreebaseSuggestion(
                freebaseSuggestion
            );
            if (triple_brain.freebase.isOfTypeTypeFromTypeId(typeId)) {
                vertexService.addType(
                    vertex,
                    externalResource,
                    successCallBack
                );
            } else {
                vertexService.addSameAs(
                    vertex,
                    externalResource,
                    successCallBack
                );
            }
        }
        freebaseStatic.listPropertiesOfFreebaseTypeId = function (vertex, freebaseId) {
            var propertiesOfTypeQuery = {
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
        freebaseStatic.removeSuggestFeatureOnVertex = function(vertex){
            $(vertex.label())
                .unbind(".suggest")
                .unbind("fb-select")
                .removeData("suggest");
        }
        eventBus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function (event, vertex, type) {
                var typeUri = type.uri();
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
                    .bind("fb-select", function (e, freebaseSuggestion) {
                        var vertex = triple_brain.ui.vertex.withId(
                            $(this).closest(".vertex").attr("id")
                        );
                        vertex.readjustLabelWidth();
                        triple_brain.vertex.updateLabel(vertex, vertex.text());
                        freebaseStatic.handleIdentificationToServer(vertex, freebaseSuggestion);
                    });
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex/type/removed',
            function(event, vertex, removedType){
                if (freebaseStatic.isFreebaseUri(removedType.uri())) {
                    freebaseStatic.removeSuggestFeatureOnVertex(
                        vertex
                    );
                }
            }
        );

    })(jQuery);

}