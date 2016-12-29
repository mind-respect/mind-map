/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.graph_element_service",
        "triple_brain.edge",
        "triple_brain.friendly_resource_service"
    ],
    function ($, EventBus, IdUri, UserService, GraphElementService, Edge, FriendlyResourceService) {
        "use strict";
        var api = {};
        api.add = function (sourceVertex, destinationVertex, callback) {
            api._add(
                sourceVertex.getUri(),
                destinationVertex.getUri(),
                callback
            );
        };
        api.addToFarVertex = function (sourceVertex, destinationVertexUri, callback) {
            api._add(
                sourceVertex.getUri(),
                destinationVertexUri,
                callback
            );
        };
        api.remove = function (edge, callback) {
            $.ajax({
                type: 'DELETE',
                url: edge.getUri()
            }).success(function () {
                api._removeCallback(
                    edge,
                    callback
                );
            });
        };
        api._removeCallback = function (edge, callback) {
            var sourceVertex = edge.getSourceVertex(),
                destinationVertex = edge.getDestinationVertex(),
                sourceVertexUri = sourceVertex.getUri(),
                destinationVertexUri = destinationVertex.getUri(),
                sourceVertexId = sourceVertex.getId(),
                destinationVertexId = destinationVertex.getId();
            if (undefined !== callback) {
                callback(
                    edge,
                    edge.getUri(),
                    sourceVertexUri,
                    destinationVertexUri
                );
            }
        };
        api.updateLabel = function (edge, label, callback) {
            FriendlyResourceService.updateLabel(
                edge,
                label,
                callback
            );
        };
        api.inverse = function (edge) {
            return $.ajax({
                type: 'PUT',
                url: edge.getUri() + "/inverse"
            });
        };
        api.changeSourceVertex = function (sourceVertex, edge, callback) {
            return $.ajax({
                type: 'PUT',
                url: edge.getUri() + "/source-vertex/" + IdUri.elementIdFromUri(sourceVertex.getUri())
            }).success(callback);
        };
        api.changeDestinationVertex = function (destinationVertex, edge, callback) {
            return $.ajax({
                type: 'PUT',
                url: edge.getUri() + "/destination-vertex/" + IdUri.elementIdFromUri(destinationVertex.getUri())
            }).success(callback);
        };
        api._add = function (sourceVertexUri, destinationVertexUri, callback) {
            var sourceVertexUriFormatted = IdUri.encodeUri(sourceVertexUri);
            var destinationVertexUriFormatted = IdUri.encodeUri(destinationVertexUri);
            var response = $.ajax({
                type: 'POST',
                url: edgesUrl() +
                '?sourceVertexId=' + sourceVertexUriFormatted +
                '&destinationVertexId=' + destinationVertexUriFormatted
            }).success(function () {
                    var newEdgeUri = IdUri.resourceUriFromAjaxResponse(
                        response
                    );
                    api._addCallback(
                        newEdgeUri,
                        sourceVertexUri,
                        destinationVertexUri,
                        callback
                    );
                }
            );
        };
        api._addCallback = function (newEdgeUri, sourceVertexUri, destinationVertexUri, callback) {
            callback(
                Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                    newEdgeUri,
                    sourceVertexUri,
                    destinationVertexUri
                )
            );
        };
        return api;
        function edgesUrl() {
            return UserService.currentUserUri() + "/graph/edge";
        }
    }
);