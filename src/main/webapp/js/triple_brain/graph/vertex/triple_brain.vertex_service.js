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
            $.ajax({
                type: 'POST',
                url: getVerticesUrl(),
                dataType: 'json'
            }).success(callback);
        };
        api.addRelationAndVertexToVertex = function (vertex, sourceBubble, callback) {
            $.ajax({
                type: 'POST',
                url: vertex.getUri(),
                dataType: 'json'
            }).success(function (tripleJson) {
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

            });
        };
        api.remove = function (vertex, callback) {
            $.ajax({
                type: 'DELETE',
                url: vertex.getUri()
            }).success(function () {
                var uri = vertex.getUri(),
                    id = vertex.getId();
                callback(vertex);
                EventBus.publish(
                    '/event/ui/graph/vertex/deleted/', [
                        uri,
                        id
                    ]);
            })
        };
        api.updateLabel = function (vertex, label, callback) {
            FriendlyResourceService.updateLabel(
                vertex,
                label,
                callback
            );
        };
        api.updateNote = function (vertex, note, callback) {
            $.ajax({
                type: 'POST',
                url: vertex.getUri() + '/comment',
                data: note,
                contentType: "text/plain"
            }).success(function () {
                EventBus.publish(
                    '/event/ui/graph/vertex/note/updated',
                    vertex
                );
                vertex.setNote(note);
                if (callback !== undefined) {
                    callback(vertex);
                }
            });
        };
        api.addType = function (vertex, type, callback) {
            GraphElementService.addType(
                vertex,
                type,
                callback
            );
        };
        api.removeIdentification = function (vertex, identification, callback) {
            GraphElementService.removeIdentification(
                vertex,
                identification,
                callback
            );
        };
        api.removeType = function (vertex, typeToRemove, callback) {
            GraphElementService.removeIdentification(
                vertex,
                typeToRemove,
                callback
            )
        };
        api.addSameAs = function (vertex, sameAs, callback) {
            GraphElementService.addSameAs(
                vertex,
                sameAs,
                callback
            );
        };
        api.removeSameAs = function (vertex, sameAs, callback) {
            GraphElementService.removeIdentification(
                vertex,
                sameAs,
                callback
            );
        };
        api.removeGenericIdentification = function (vertex, genericIdentification, callback) {
            GraphElementService.removeIdentification(
                vertex,
                genericIdentification,
                callback
            );
        };
        api.addGenericIdentification = function (vertex, identification, callback) {
            GraphElementService.addGenericIdentification(
                vertex,
                identification,
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
            $.ajax({
                type: 'POST',
                url: vertex.getUri() + '/suggestions',
                data: Suggestion.formatAllForServer(suggestions),
                contentType: 'application/json;charset=utf-8'
            }).success(function () {
                vertex.addSuggestions(suggestions);
                EventBus.publish(
                    '/event/ui/graph/vertex/suggestions/updated',
                    [vertex, suggestions]
                );
            });
        };
        api.makePrivate = function (vertex, callback) {
            setPrivacy(
                false,
                vertex,
                function () {
                    vertex.makePrivate();
                    if (callback !== undefined) {
                        callback();
                    }
                }
            );
        };
        api.makePublic = function (vertex, callback) {
            setPrivacy(
                true,
                vertex,
                function () {
                    vertex.makePublic();
                    if (callback !== undefined) {
                        callback();
                    }
                }
            );
        };
        api.makeCollectionPrivate = function (vertices, callback) {
            setCollectionPrivacy(false, vertices, function () {
                $.each(vertices, function () {
                    var vertex = this;
                    vertex.makePrivate();
                });
                if (callback !== undefined) {
                    callback();
                }
            });
        };
        api.makeCollectionPublic = function (vertices, callback) {
            setCollectionPrivacy(true, vertices, function () {
                $.each(vertices, function () {
                    var vertex = this;
                    vertex.makePublic();
                });
                if (callback !== undefined) {
                    callback();
                }
            });
        };
        api.group = function (graphElementsUris, callback) {
            var response = $.ajax({
                type: 'POST',
                url: getVerticesUrl() + '/group',
                data: $.toJSON(graphElementsUris),
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
        function setCollectionPrivacy(isPublic, vertices, callback) {
            var typeQueryParam = isPublic ? "public" : "private";
            var verticesUri = [];
            $.each(vertices, function () {
                var vertex = this;
                verticesUri.push(vertex.getUri())
            });
            $.ajax({
                type: 'POST',
                data: $.toJSON(verticesUri),
                contentType: 'application/json;charset=utf-8',
                url: getVerticesUrl() + '/collection/public_access?type=' + typeQueryParam
            }).success(callback);
        }

        function setPrivacy(isPublic, vertex, callback) {
            $.ajax({
                type: isPublic ? 'POST' : 'DELETE',
                url: vertex.getUri() + '/public_access'
            }).success(callback);
        }

        function getVerticesUrl() {
            return UserService.currentUserUri() + "/graph/vertex"
        }
    }
);