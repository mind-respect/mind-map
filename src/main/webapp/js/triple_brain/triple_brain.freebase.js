define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.suggestion",
    "triple_brain.external_resource",
    "jquery.freebase_suggest.min",
    "jquery.url"
],
    function ($, EventBus, Vertex, VertexService, Suggestion, ExternalResource) {
        var api = {};
        api.freebaseIdToURI = function (freebaseId) {
            return "http://rdf.freebase.com/rdf" + freebaseId;
        };
        api.idInFreebaseURI = function (freebaseURI) {
            return freebaseURI.replace("http://rdf.freebase.com/rdf", "");
        };
        api.isOfTypeTypeFromTypeId = function (typeId) {
            return typeId == "/type/type";
        };
        api.isFreebaseUri = function (uri) {
            return $.url(uri).attr()
                .host
                .toLowerCase()
                .indexOf("freebase.com") != -1;
        };
        api.handleIdentificationToServer = function(vertex, freebaseSuggestion, successCallBack){
            var typeId = freebaseSuggestion.notable.id;
            var externalResource = ExternalResource.fromFreebaseSuggestion(
                freebaseSuggestion
            );
            if (api.isOfTypeTypeFromTypeId(typeId)) {
                vertexService().addType(
                    vertex,
                    externalResource,
                    successCallBack
                );
            } else {
                vertexService().addSameAs(
                    vertex,
                    externalResource,
                    successCallBack
                );
            }
        };
        api.listPropertiesOfFreebaseTypeId = function (vertex, freebaseId) {
            Suggestion = require("triple_brain.suggestion")
            var propertiesOfTypeQuery = {
                id:freebaseId,
                type:"/type/type",
                properties:[
                    {   id:null,
                        name:null,
                        expected_type:null
                    }
                ]
            };
            $.ajax({
                type:'GET',
                url:'https://www.googleapis.com/freebase/v1/mqlread?query=' + JSON.stringify(propertiesOfTypeQuery),
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
                            Suggestion.fromFreebaseSuggestionAndTypeUri(
                                freebaseProperty,
                                api.freebaseIdToURI(
                                    result.result.id
                                )
                            )
                        )
                    })
                    vertexService().addSuggestions(
                        vertex,
                        suggestions
                    );
                })
        };
        api.removeSuggestFeatureOnVertex = function(vertex){
            $(vertex.label())
                .unbind(".suggest")
                .unbind("fb-select")
                .removeData("suggest");
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function (event, vertex, type) {
                var typeUri = type.uri();
                if (!api.isFreebaseUri(typeUri)) {
                    return;
                }
                var typeId = api.idInFreebaseURI(typeUri);
                api.listPropertiesOfFreebaseTypeId(
                    vertex,
                    typeId
                );
                $(vertex.label()).suggest({
                    "zIndex":20,
                    "type":typeId
                })
                    .bind("fb-select", function (e, freebaseSuggestion) {
                        Vertex = require("triple_brain.ui.vertex");
                        var vertex = Vertex.withId(
                            $(this).closest(".vertex").attr("id")
                        );
                        vertex.triggerChange();
                        api.handleIdentificationToServer(
                            vertex,
                            freebaseSuggestion
                        );
                    });
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex/type/removed',
            function(event, vertex, removedType){
                if (api.isFreebaseUri(removedType.uri())) {
                    api.removeSuggestFeatureOnVertex(
                        vertex
                    );
                }
            }
        );
        function vertexService(){
            return VertexService === undefined ?
                require("triple_brain.vertex") :
                VertexService;
        }
        return api;
    }
);