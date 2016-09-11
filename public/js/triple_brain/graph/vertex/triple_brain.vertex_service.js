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
            }).success(callback);
        };
        api.createVertex = function (callback) {
            return $.ajax({
                type: 'POST',
                url: getVerticesUrl(),
                dataType: 'json'
            }).success(callback);
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
                [triple, sourceBubble]
            );
        };
        api.remove = function (vertex) {
            return $.ajax({
                type: 'DELETE',
                url: vertex.getUri()
            });
        };
        api.updateLabel = function (vertex, label, callback) {
            FriendlyResourceService.updateLabel(
                vertex,
                label,
                callback
            );
        };
        api.getSuggestions = function (vertex) {
            $.ajax({
                type: 'GET',
                url: vertex.getUri() + '/suggestions',
                dataType: 'json'
            }).success(function (jsonSuggestions) {
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
            ).success(function () {
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
            }).success(function () {
                    var createdVertexUri = response.getResponseHeader("Location");
                    var relativeUri = createdVertexUri.substring(
                        createdVertexUri.indexOf("/service")
                    );
                    callback(
                        relativeUri
                    );
                }
            );
        };
        return api;
        function setCollectionPrivacy(isPublic, vertices) {
            var typeQueryParam = isPublic ? "public" : "private";
            var verticesUri = [];
            $.each(vertices, function () {
                var vertex = this;
                verticesUri.push(
                    vertex.getUri()
                );
            });
            return $.ajax({
                type: 'POST',
                data: JSON.stringify(verticesUri),
                contentType: 'application/json;charset=utf-8',
                url: getVerticesUrl() + '/collection/public_access?type=' + typeQueryParam
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
    }
);