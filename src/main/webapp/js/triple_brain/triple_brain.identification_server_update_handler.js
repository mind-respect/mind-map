/*
 * Copyright Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.server_subscriber",
        "triple_brain.graph_displayer",
        "triple_brain.id_uri",
        "triple_brain.identification_server_facade"
    ],
    function ($, ServerSubscriber, GraphDisplayer, IdUriUtils, IdentificationFacade) {
        var api = {};
        api.forFriendlyResource = function (friendlyResource) {
            return new Object(
                friendlyResource
            );
        };
        function Object(identification) {
            this.listenForUpdates = function (listenerReadyCallBack) {
                ServerSubscriber.subscribe(
                        "/identification/" + IdUriUtils.encodeUri(
                        identification.getExternalResourceUri()
                    ) + "/updated",
                    updateWithServerJson,
                    listenerReadyCallBack
                );
            };
            function updateWithServerJson(externalResourceAsJson) {
                identification = IdentificationFacade.fromServerFormat(
                    externalResourceAsJson
                );
                GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                    $.each(vertex.getIdentifications(), function () {
                        var vertexIdentification = this;
                        if (identification.getExternalResourceUri() === vertexIdentification.getExternalResourceUri()) {
                            vertex.addImages(identification.getImages());
                            vertex.refreshImages();
                        }
                    });
                });
            }
        }
        return api;
    }
);