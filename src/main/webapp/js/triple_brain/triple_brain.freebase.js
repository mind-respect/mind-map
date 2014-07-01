define([
    "require",
    "jquery",
    "triple_brain.freebase_uri",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer",
    "triple_brain.vertex",
    "triple_brain.suggestion",
    "triple_brain.friendly_resource_server_facade",
    "jquery.url"
],
    function (require, $, FreebaseUri, EventBus, GraphDisplayer, VertexService, Suggestion, FriendlyResourceFacade) {
        var api = {};
        api.handleIdentificationToServer = function (vertex, freebaseSuggestion, successCallBack) {
            var externalResource = FriendlyResourceFacade.fromFreebaseSuggestion(
                freebaseSuggestion
            );
            var typeId = getTypeId();
            if (FreebaseUri.isOfTypeTypeFromTypeId(typeId)) {
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
            function getTypeId() {
                if (freebaseSuggestion.notable === undefined) {
                    return "";
                } else {
                    return freebaseSuggestion.notable.id;
                }
            }
        };
        api.listPropertiesOfFreebaseTypeId = function (vertex, freebaseId) {
            Suggestion = require("triple_brain.suggestion");
            var propertiesOfTypeQuery = {
                id:freebaseId,
                type:"/type/type",
                properties:[
                    {   id:null,
                        name:null,
                        expected_type: {
                            id: null,
                            name: null
                        }
                    }
                ]
            };
            $.ajax({
                type:'GET',
                url:'https://www.googleapis.com/freebase/v1/mqlread?query=' + JSON.stringify(
                    propertiesOfTypeQuery
                ),
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
                                FreebaseUri.freebaseIdToURI(
                                    result.result.id
                                )
                            )
                        );
                    });
                    if(suggestions.length > 0){
                        vertexService().addSuggestions(
                            vertex,
                            suggestions
                        );
                    }
                })
        };
        api.removeSuggestFeatureOnVertex = function (vertex) {
            vertex.getLabel().autocomplete("destroy");
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex/type/added ' +
                '/event/ui/graph/vertex/same_as/added ' +
                '/event/ui/graph/vertex/generic_identification/added',
            function (event, vertex, identification) {
                var identificationUri = identification.getUri();
                if (!FreebaseUri.isFreebaseUri(identificationUri)) {
                    return;
                }
                var identificationId = FreebaseUri.idInFreebaseURI(identificationUri);
                api.listPropertiesOfFreebaseTypeId(
                    vertex,
                    identificationId
                );
                vertex.getLabel().tripleBrainAutocomplete({
                    select:function (event, ui) {
                        var vertex = GraphDisplayer.getVertexSelector().withId(
                            $(this).closest(".vertex").attr("id")
                        );
                        vertex.triggerChange();
                        var searchResult = ui.item;
                        var identificationResource = FriendlyResourceFacade.withUriLabelAndDescription(
                            searchResult.uri,
                            searchResult.label,
                            searchResult.description
                        );
                        vertexService().addGenericIdentification(
                            vertex,
                            identificationResource
                        );
                    },
                    resultsProviders:[
                        require(
                            "triple_brain.freebase_autocomplete_provider"
                        ).toFetchForTypeId(identificationId)
                    ]
                });
            }
        );

        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function (event, vertex) {
                prepareAsYouTypeSuggestions(vertex);
            }
        );

        function prepareAsYouTypeSuggestions(vertex) {
            var vertexTypes = vertex.getTypes();
            if (vertexTypes.length == 0) {
                return;
            }
            var filterValue = "(all ";
            $.each(vertexTypes, function () {
                var identification = this;
                if (FreebaseUri.isFreebaseUri(identification.getUri())) {
                    filterValue += "type:" + FreebaseUri.idInFreebaseURI(identification.getUri());
                }
            });
            filterValue += ")";
            vertex.getLabel().tripleBrainAutocomplete({
                select:function (event, ui) {
                    var vertex = GraphDisplayer.getVertexSelector().withId(
                        $(this).closest(".vertex").attr("id")
                    );
                    vertex.triggerChange();
                    var searchResult = ui.item;
                    var identificationResource = FriendlyResourceFacade.withUriLabelAndDescription(
                        searchResult.uri,
                        searchResult.label,
                        searchResult.description
                    );
                    vertexService().addSameAs(
                        vertex,
                        identificationResource
                    );
                },
                resultsProviders:[
                    require(
                        "triple_brain.freebase_autocomplete_provider"
                    ).fetchUsingOptions({
                            filter:filterValue
                        })
                ]
            });
        }

        EventBus.subscribe(
            '/event/ui/graph/vertex/type/removed',
            function (event, vertex, removedType) {
                if (FreebaseUri.isFreebaseUri(removedType.uri())) {
                    api.removeSuggestFeatureOnVertex(
                        vertex
                    );
                }
            }
        );
        function vertexService() {
            return VertexService === undefined ?
                require("triple_brain.vertex") :
                VertexService;
        }

        return api;
    }
);