define([
        "require",
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.id_uri",
        "triple_brain.user",
        "triple_brain.graph_element",
        "triple_brain.edge_server_facade"
    ],
    function (require, $, EventBus, IdUriUtils, UserService, GraphElement, EdgeServerFacade) {
        var api = {};
        api.add = function (sourceVertex, destinationVertex, callback) {
            add(
                sourceVertex.getUri(),
                destinationVertex.getUri(),
                callback
            );
        };
        api.addToFarVertex = function (sourceVertex, destinationVertexUri, callback) {
            add(
                sourceVertex.getUri(),
                destinationVertexUri,
                callback
            );
        };
        api.remove = function (edge, callback) {
            var edgeUri = edge.getUri();
            $.ajax({
                type: 'DELETE',
                url: edgeUri
            }).success(function () {
                var sourceVertex = edge.sourceVertex(),
                    destinationVertex = edge.destinationVertex(),
                    sourceVertexUri = sourceVertex.getUri(),
                    destinationVertexUri = destinationVertex.getUri(),
                    sourceVertexId = sourceVertex.getId(),
                    destinationVertexId = destinationVertex.getId();
                callback(
                    edge,
                    edgeUri,
                    sourceVertexUri,
                    destinationVertexUri
                );
                EventBus.publish(
                    '/event/ui/graph/relation/deleted', [
                        edge,
                        edgeUri,
                        sourceVertexUri,
                        destinationVertexUri,
                        sourceVertexId,
                        destinationVertexId
                    ]
                );
            });
        };
        api.updateLabel = function (edge, label, callback) {
            $.ajax({
                type: 'POST',
                url: edge.getUri() + "/label" + '?label=' + label
            }).success(function () {
                callback(edge);
                EventBus.publish(
                    '/event/ui/graph/edge/label/updated',
                    edge
                );
            });
        };
        api.addSameAs = function (edge, sameAs, callback) {
            sameAs.setType("same_as");
            GraphElement.addIdentification(
                edge,
                sameAs,
                function (edge, updatedIdentification) {
                    if (callback !== undefined) {
                        callback();
                    }
                    publishIdentificationAdded(
                        edge,
                        updatedIdentification
                    );
                }
            );
        };
        api.removeSameAs = function (edge, sameAs, callback) {
            GraphElement.removeIdentification(
                edge,
                sameAs,
                function () {
                    edge.removeSameAs(sameAs);
                    if (callback != undefined) {
                        callback(
                            edge,
                            sameAs
                        );
                    }
                }
            );
        };
        api.addType = function (edge, type, callback) {
            type.setType("type");
            GraphElement.addIdentification(
                edge,
                type,
                function (edge, updatedIdentification) {
                    if (callback !== undefined) {
                        callback();
                    }
                    publishIdentificationAdded(
                        edge,
                        updatedIdentification
                    );
                }
            );
        };
        api.removeType = function (edge, type, callback) {
            GraphElement.removeIdentification(
                edge,
                type,
                function () {
                    edge.removeType(type);
                    if (callback != undefined) {
                        callback(
                            edge,
                            type
                        );
                    }
                }
            );
        };
        api.inverse = function (edge, callback) {
            $.ajax({
                type: 'PUT',
                url: edge.getUri() + "/inverse"
            }).success(callback);
        };
        return api;
        function edgesUrl() {
            return UserService.currentUserUri() + "/graph/edge";
        }

        function add(sourceVertexUri, destinationVertexUri, callback) {
            var sourceVertexUriFormatted = IdUriUtils.encodeUri(sourceVertexUri);
            var destinationVertexUriFormatted = IdUriUtils.encodeUri(destinationVertexUri);
            var response = $.ajax({
                type: 'POST',
                url: edgesUrl() +
                    '?sourceVertexId=' + sourceVertexUriFormatted +
                    '&destinationVertexId=' + destinationVertexUriFormatted
            }).success(function () {
                    var responseUri = IdUriUtils.removeDomainNameFromGraphElementUri(
                        response.getResponseHeader("Location")
                    );
                    callback(
                        getEdgeServerFacade().buildObjectWithUriOfSelfSourceAndDestinationVertex(
                            responseUri,
                            sourceVertexUri,
                            destinationVertexUri
                        )
                    );
                }
            );
        }

        function publishIdentificationAdded(edge, identification) {
            EventBus.publish(
                '/event/ui/graph/edge/identification/added',
                [edge, identification]
            );
        }

        function getEdgeServerFacade() {
            if (undefined === EdgeServerFacade) {
                EdgeServerFacade = require("triple_brain.edge_server_facade");
            }
            return EdgeServerFacade;
        }
    }
);