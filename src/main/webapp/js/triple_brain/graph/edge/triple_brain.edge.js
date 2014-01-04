define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.user",
    "triple_brain.graph_element"
],
    function (require, $, EventBus, IdUriUtils, UserService, GraphElement) {
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
                type:'DELETE',
                url:edgeUri
            }).success(function () {
                    var sourceVertexUri = edge.sourceVertex().getUri();
                    var destinationVertexUri = edge.destinationVertex().getUri();
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
                            destinationVertexUri
                        ]
                    );
                });
        };
        api.updateLabel = function (edge, label) {
            $.ajax({
                type:'POST',
                url:edge.getUri() + "/label" + '?label=' + label
            }).success(function () {
                    EventBus.publish(
                        '/event/ui/graph/edge/label/updated',
                        edge
                    );
                });
        };
        api.addSameAs = function (edge, sameAs, callback) {
            sameAs.type = "same_as";
            GraphElement.addIdentification(
                edge,
                sameAs,
                function () {
                    if (callback !== undefined) {
                        callback();
                    }
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
            type.type = "type";
            GraphElement.addIdentification(
                edge,
                type,
                callback
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
                type:'PUT',
                url:edge.getUri() + "/inverse"
            }).success(callback);
        };
        return api;
        function edgesUrl() {
            return UserService.currentUserUri() + "/graph/edge";
        }

        function add(sourceVertexUri, destinationVertexUri, callback) {
            var Edge = require("triple_brain.ui.edge");
            var sourceVertexUriFormatted = IdUriUtils.encodeUri(sourceVertexUri);
            var destinationVertexUriFormatted = IdUriUtils.encodeUri(destinationVertexUri);
            var response = $.ajax({
                type:'POST',
                url:edgesUrl() +
                    '?sourceVertexId=' + sourceVertexUriFormatted +
                    '&destinationVertexId=' + destinationVertexUriFormatted
            }).success(function () {
                    var responseUri = response.getResponseHeader("Location");
                    var edgeServerFormatted = {};
                    edgeServerFormatted.uri = responseUri;
                    edgeServerFormatted.source_vertex_id = sourceVertexUri;
                    edgeServerFormatted.destination_vertex_id = destinationVertexUri;
                    edgeServerFormatted.label = Edge.getWhenEmptyLabel();
                    edgeServerFormatted.types = [];
                    edgeServerFormatted.same_as = [];
                    callback(edgeServerFormatted);
                }
            );
        }
    }
);