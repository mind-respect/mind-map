/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.server_subscriber",
    "triple_brain.graph_displayer",
    "triple_brain.id_uri",
    "triple_brain.friendly_resource_server_facade",
    "triple_brain.freebase_uri",
    "jquery.json.min"
],
    function (require, $, ServerSubscriber, GraphDisplayer, IdUriUtils, FriendlyResourceServerFacade, FreebaseUri) {
        var api = {};
        api.withUri = function (uri) {
            return api.withUriAndLabel(
                uri,
                ""
            );
        };
        api.withUriAndLabel = function (uri, label) {
            return api.withUriLabelAndDescription(
                uri,
                label,
                "",
                []
            );
        };
        api.withUriLabelAndDescription = function (uri, label, description) {
            return new ExternalResource(
                uri,
                label,
                description,
                []
            );
        };
        api.fromFreebaseSuggestion = function (freebaseSuggestion) {
            return new ExternalResource(
                FreebaseUri.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                freebaseSuggestion.name,
                undefined,
                []
            )
        };
        api.fromServerFormatFacade = function (serverJson) {
            return new ExternalResource(
                serverJson.getUri(),
                serverJson.getLabel(),
                serverJson.getComment(),
                serverJson.getImages()
            );
        };
        api.fromSearchResult = function (searchResult) {
            return api.withUriLabelAndDescription(
                searchResult.uri,
                searchResult.label,
                searchResult.comment
            );
        };

        function ExternalResource(uri, label, description, images) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            };
            this.label = function () {
                return label;
            };
            this.description = function () {
                return description === undefined ? "" : description;
            };
            this.images = function () {
                return images;
            };
            this.listenForUpdates = function (listenerReadyCallBack) {
                ServerSubscriber.subscribe(
                    "/identification/" + IdUriUtils.encodeUri(thisExternalResource.uri()) + "/updated",
                    updateWithServerJson,
                    listenerReadyCallBack
                );
            };
            this.isAGraphElement = function () {
                return uri.indexOf("/service") === 0;
            };
            function updateWithServerJson(externalResourceAsJson) {
                var externalResource = api.fromServerFormatFacade(
                    FriendlyResourceServerFacade.fromServerFormat(
                        externalResourceAsJson
                    )
                );
                uri = externalResource.uri();
                label = externalResource.label();
                description = externalResource.description();
                images = externalResource.images();
                GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                    $.each(vertex.getIdentifications(), function () {
                        var identification = this;
                        if (identification.uri() === thisExternalResource.uri()) {
                            vertex.addImages(images);
                        }
                    });
                });
            }

            this.serverFormat = function () {
                return $.toJSON(
                    thisExternalResource.jsonFormat()
                );
            };
            this.jsonFormat = function () {
                return {
                    uri: thisExternalResource.uri(),
                    label: thisExternalResource.label(),
                    comment: thisExternalResource.description(),
                    images: thisExternalResource.images
                }
            };
            this.setType = function (type) {
                thisExternalResource.type = type;
            };
            this.getType = function () {
                return thisExternalResource.type;
            };
        }

        return api;
    }
);