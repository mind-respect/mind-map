/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.freebase_uri",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.vertex_service",
        "triple_brain.suggestion",
        "triple_brain.identification",
        "triple_brain.image",
        "triple_brain.graph_element_service",
        "triple_brain.freebase_autocomplete_provider",
        "jquery.url"
    ],
    function ($, FreebaseUri, EventBus, GraphDisplayer, VertexService, Suggestion, Identification, Image, GraphElementService, FreebaseAutocompleteProvider) {
        var api = {};
        api.handleIdentificationToServer = function (vertex, freebaseSuggestion, successCallBack) {
            var externalResource = Identification.fromFreebaseSuggestion(
                freebaseSuggestion
            );
            var typeId = getTypeId();
            if (FreebaseUri.isOfTypeTypeFromTypeId(typeId)) {
                VertexService.addType(
                    vertex,
                    externalResource,
                    successCallBack
                );
            } else {
                VertexService.addSameAs(
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
        api.addSuggestionsToVertexFromFreebaseId = function (vertex, freebaseId) {
            var propertiesOfTypeQuery = {
                id: freebaseId,
                type: "/type/type",
                properties: [
                    {   id: null,
                        name: null,
                        "/common/topic/description": [],
                        expected_type: {
                            id: null,
                            name: null,
                            "/common/topic/description": []
                        }
                    }
                ]
            };
            $.ajax({
                type: 'GET',
                url: FreebaseUri.MQL_READ_URL + "?query=" + JSON.stringify(
                    propertiesOfTypeQuery
                ) +
                    "&lang=" + FreebaseUri.getMqlReadLocale() +
                    "&key=" + FreebaseUri.key,
                dataType: 'jsonp'
            }).success(function (result) {
                var freebaseProperties = [];
                if (result.result) {
                    freebaseProperties = result.result.properties;
                }
                var suggestions = [];
                $.each(freebaseProperties, function () {
                    var freebaseProperty = this;
                    suggestions.push(
                        Suggestion.fromFreebaseSuggestionAndOriginUri(
                            freebaseProperty,
                            FreebaseUri.freebaseIdToUri(
                                result.result.id
                            )
                        )
                    );
                });
                if (suggestions.length > 0) {
                    VertexService.addSuggestions(
                        vertex,
                        suggestions
                    );
                }
            });
        };
        api.removeSuggestFeatureOnVertex = function (vertex) {
            vertex.getLabel().autocomplete("destroy");
        };

        function defineDescription(graphElement, freebaseId, identification) {
            $.ajax({
                type: 'GET',
                url: FreebaseUri.SEARCH_URL +
                    "?query=" + freebaseId +
                    "&key=" + FreebaseUri.key +
                    "&output=(description)&lang=" + FreebaseUri.getFreebaseFormattedUserLocales(),
                dataType: 'jsonp'
            }).success(function (xhr) {
                var hasDescription = xhr.result[0].output.description["/common/topic/description"] !== undefined;
                if (!hasDescription) {
                    return;
                }
                var description = xhr.result[0].output.description["/common/topic/description"][0];
                if ('object' === typeof description) {
                    description = description.value;
                }
                GraphElementService.setDescriptionToIdentification(
                    graphElement,
                    identification,
                    description
                );
            });
        }

        function defineImages(graphElement, freebaseId, identification) {
            var imageQuery = {
                id: freebaseId,
                "/common/topic/image": [
                    {
                        id: [],
                        limit: 1
                    }
                ]
            };
            $.ajax({
                type: 'GET',
                url: 'https://www.googleapis.com/freebase/v1/mqlread?query=' + JSON.stringify(
                    imageQuery
                ) + "&raw=true&key=" + FreebaseUri.key,
                dataType: 'jsonp'
            }).success(function (result) {
                var freebaseImages = [];
                if (result.result) {
                    freebaseImages = result.result["/common/topic/image"];
                }
                if (freebaseImages.length === 0) {
                    return;
                }
                var freebaseImage = freebaseImages[0],
                    imageId = freebaseImage.id[0],
                    url = FreebaseUri.IMAGE_URL +
                        imageId +
                        "?maxwidth=55&key=" +
                        FreebaseUri.key;
                Image.getBase64OfExternalUrl(url, function (base64) {
                    GraphElementService.addImageToIdentification(
                        graphElement,
                        identification,
                        Image.withBase64ForSmallAndUrlForBigger(
                            base64,
                                FreebaseUri.IMAGE_URL +
                                imageId +
                                "?maxwidth=600&key=" +
                                FreebaseUri.key
                        )
                    );
                });

            });
        }

        EventBus.subscribe(
            '/event/ui/graph/identification/added',
            identificationAddedHandler
        );

        function identificationAddedHandler(event, graphElement, identification) {
            var identificationUri = identification.getExternalResourceUri();
            if (!FreebaseUri.isFreebaseUri(identificationUri)) {
                return;
            }
            var identificationId = FreebaseUri.idInFreebaseURI(identificationUri);
            if (graphElement.isVertex()) {
                api.addSuggestionsToVertexFromFreebaseId(
                    graphElement,
                    identificationId
                );
            }
            if (graphElement.isBubble()) {
                updateIdentificationImages(
                    identification,
                    graphElement,
                    identificationId
                )
            }
            if (!identification.hasComment()) {
                defineDescription(
                    graphElement,
                    identificationId,
                    identification
                );
            }
            graphElement.getLabel().tripleBrainAutocomplete({
                select: function (event, ui) {
                    var vertex = GraphDisplayer.getVertexSelector().withId(
                        $(this).closest(".vertex").attr("id")
                    );
                    vertex.triggerChange();
                    var searchResult = ui.item;
                    var identificationResource = Identification.withUriLabelAndDescription(
                        searchResult.uri,
                        searchResult.label,
                        searchResult.description
                    );
                    VertexService.addGenericIdentification(
                        vertex,
                        identificationResource
                    );
                },
                resultsProviders: [
                    FreebaseAutocompleteProvider.toFetchForTypeId(
                        identificationId
                    )
                ]
            });
        }

        function updateIdentificationImages(identification, graphElement, identificationId) {
            if (identification.hasImages()) {
                graphElement.refreshImages();
            } else {
                defineImages(
                    graphElement,
                    identificationId,
                    identification
                );
            }
        }

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
                if (FreebaseUri.isFreebaseUri(identification.getExternalResourceUri())) {
                    filterValue += "type:" + FreebaseUri.idInFreebaseURI(identification.getExternalResourceUri());
                }
            });
            filterValue += ")";
            vertex.getLabel().tripleBrainAutocomplete({
                select: function (event, ui) {
                    var vertex = GraphDisplayer.getVertexSelector().withId(
                        $(this).closest(".vertex").attr("id")
                    );
                    vertex.triggerChange();
                    var searchResult = ui.item;
                    var identificationResource = Identification.withUriLabelAndDescription(
                        searchResult.uri,
                        searchResult.label,
                        searchResult.description
                    );
                    VertexService.addSameAs(
                        vertex,
                        identificationResource
                    );
                },
                resultsProviders: [
                    FreebaseAutocompleteProvider.fetchUsingOptions({
                            filter: filterValue
                        })
                ]
            });
        }

        EventBus.subscribe(
            '/event/ui/graph/identification/removed',
            function (event, vertex, removedType) {
                if (FreebaseUri.isFreebaseUri(removedType.getUri())) {
                    api.removeSuggestFeatureOnVertex(
                        vertex
                    );
                }
            }
        );

        return api;
    }
);