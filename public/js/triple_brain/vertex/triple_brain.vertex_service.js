/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.triple_ui_builder",
        "triple_brain.suggestion",
        "triple_brain.graph_element_service",
        "triple_brain.user_service",
        "triple_brain.friendly_resource_service"
    ],
    function ($, EventBus, TripleUiBuilder, Suggestion, GraphElementService, UserService, FriendlyResourceService) {
        "use strict";
        var api = {};
        api.getByUri = function (uri, callback) {
            return $.ajax({
                type: 'GET',
                url: uri,
                dataType: 'json'
            }).then(callback);
        };
        api.createVertex = function (callback) {
            return $.ajax({
                type: 'POST',
                url: getVerticesUrl(),
                dataType: 'json'
            }).then(callback);
        };
        api.addRelationAndVertexToVertex = function (vertex, sourceBubble, callback) {
            return $.ajax({
                type: 'POST',
                url: vertex.getUri(),
                dataType: 'json'
            }).done(function (tripleJson) {
                api._addRelationAndVertexToVertexCallback(
                    tripleJson,
                    sourceBubble,
                    callback
                );
            });
        };
        api._addRelationAndVertexToVertexCallback = function (tripleJson, sourceBubble, callback) {
            var triple = TripleUiBuilder.createIntoSourceBubble(
                sourceBubble,
                tripleJson
            );
            if (callback !== undefined) {
                callback(triple, tripleJson);
            }
            EventBus.publish(
                '/event/ui/graph/vertex_and_relation/added/',
                [triple, tripleJson]
            );
        };
        api.remove = function (vertex) {
            return $.ajax({
                type: 'DELETE',
                url: vertex.getUri()
            });
        };
        api.removeCollection = function (vertices) {
            return $.ajax({
                type: 'DELETE',
                data: JSON.stringify(verticesUriFromVertices(vertices)),
                contentType: 'application/json;charset=utf-8',
                url: getVerticesUrl() + '/collection'
            });
        };
        api.updateLabel = function (vertex, label) {
            return FriendlyResourceService.updateLabel(
                vertex,
                label
            );
        };
        api.getSuggestions = function (vertex) {
            return $.ajax({
                type: 'GET',
                url: vertex.getUri() + '/suggestions',
                dataType: 'json'
            }).then(function (jsonSuggestions) {
                var suggestions = Suggestion.fromServerArray(
                    jsonSuggestions
                );
                vertex.setSuggestions(
                    suggestions
                );
                EventBus.publish(
                    '/event/ui/graph/vertex/suggestions/updated',
                    [vertex, suggestions]
                );
            });
        };
        api.addSuggestions = function (vertex, suggestions) {
            return api.addSuggestionsAjax(
                vertex, suggestions
            ).then(function () {
                vertex.addSuggestions(suggestions);
                EventBus.publish(
                    '/event/ui/graph/vertex/suggestions/updated',
                    [vertex, suggestions]
                );
            });
        };
        api.addSuggestionsAjax = function (vertex, suggestions) {
            return $.ajax({
                type: 'POST',
                url: vertex.getUri() + '/suggestions',
                data: Suggestion.formatAllForServer(suggestions),
                contentType: 'application/json;charset=utf-8'
            });
        };
        api.makePrivate = function (vertexUi) {
            return setPrivacy(
                false,
                vertexUi
            );
        };
        api.makePublic = function (vertexUi) {
            return setPrivacy(
                true,
                vertexUi
            );
        };
        api.makeCollectionPrivate = function (vertices) {
            return setCollectionPrivacy(
                false,
                vertices
            );
        };
        api.makeCollectionPublic = function (vertices) {
            return setCollectionPrivacy(
                true,
                vertices
            );
        };
        api.group = function (graphElementsUris, callback) {
            var response = $.ajax({
                type: 'POST',
                url: getVerticesUrl() + '/group',
                data: JSON.stringify(graphElementsUris),
                contentType: 'application/json;charset=utf-8'
            }).then(function () {
                    var createdVertexUri = response.getResponseHeader("Location");
                    var relativeUri = createdVertexUri.substring(
                        createdVertexUri.indexOf("/service")
                    );
                    callback(
                        relativeUri
                    );
                }
            );
            return response;
        };
        return api;
        function setCollectionPrivacy(isPublic, vertices) {
            return $.ajax({
                type: isPublic ? 'POST' : 'DELETE',
                data: JSON.stringify(verticesUriFromVertices(vertices)),
                contentType: 'application/json;charset=utf-8',
                url: getVerticesUrl() + '/collection/public_access'
            });
        }

        function setPrivacy(isPublic, vertex) {
            return $.ajax({
                type: isPublic ? 'POST' : 'DELETE',
                url: vertex.getUri() + '/public_access'
            });
        }

        function getVerticesUrl() {
            return UserService.currentUserUri() + "/graph/vertex";
        }

        function verticesUriFromVertices(vertices) {
            var verticesUri = [];
            $.each(vertices, function () {
                var vertex = this;
                verticesUri.push(
                    vertex.getUri()
                );
            });
            return verticesUri;
        }
    }
);