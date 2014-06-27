/*
 * Copyright Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.server_subscriber",
        "triple_brain.graph_displayer",
        "triple_brain.id_uri",
        "triple_brain.friendly_resource_server_facade"
    ],
    function ($, ServerSubscriber, GraphDisplayer, IdUriUtils, FriendlyResourceFacade) {
        var api = {};
        api.forFriendlyResource = function (friendlyResource) {
            return new Object(
                friendlyResource
            );
        };
        function Object(friendlyResource) {
            this.listenForUpdates = function (listenerReadyCallBack) {
                ServerSubscriber.subscribe(
                        "/identification/" + IdUriUtils.encodeUri(friendlyResource.getUri()) + "/updated",
                    updateWithServerJson,
                    listenerReadyCallBack
                );
            };
            function updateWithServerJson(externalResourceAsJson) {
                friendlyResource = FriendlyResourceFacade.fromServerFormat(
                    externalResourceAsJson
                );
                GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                    $.each(vertex.getIdentifications(), function () {
                        var identification = this;
                        if (identification.getUri() === friendlyResource.getUri()) {
                            vertex.addImages(friendlyResource.getImages());
                            vertex.refreshImages();
                        }
                    });
                });
            }
        }
        return api;
    }
);