define([
        "require",
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.ui.triple",
        "triple_brain.suggestion",
        "triple_brain.graph_element",
        "triple_brain.user"
    ],
    function (require, $, EventBus, Triple, Suggestion, GraphElement, UserService) {
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
                var triple = Triple.createIntoSourceBubble(
                    sourceBubble,
                    tripleJson
                );
                if(callback !== undefined){
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
                var uri = vertex.getUri();
                var id = vertex.getId();
                callback(vertex);
                EventBus.publish(
                    '/event/ui/graph/vertex/deleted/', [
                        uri,
                        id
                    ]);
            })
        };
        api.updateLabel = function (vertex, label, callback) {
            $.ajax({
                type: 'POST',
                url: vertex.getUri() + '/label',
                data: $.toJSON({content: label}),
                contentType: 'application/json;charset=utf-8'
            }).success(function () {
                EventBus.publish(
                    '/event/ui/graph/vertex/label/updated',
                    vertex
                );
                if (callback !== undefined) {
                    callback(vertex);
                }
            });
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
        api.addType = function (vertex, type, successCallback) {
            type.setType("type");
            addIdentification(
                vertex,
                type,
                successCallback
            );
        };
        api.removeIdentification = function (vertex, identification, successCallback) {
            GraphElement.removeIdentification(
                vertex,
                identification,
                successCallback
            );
        };
        api.removeType = function (vertex, typeToRemove, successCallback) {
            api.removeIdentification(
                vertex,
                typeToRemove,
                function () {
                    vertex.removeType(typeToRemove);
                    if (successCallback != undefined) {
                        successCallback(
                            vertex,
                            typeToRemove
                        );
                    }
                    EventBus.publish(
                        '/event/ui/graph/vertex/type/removed',
                        [vertex, typeToRemove]
                    );
                }
            );
        };
        api.addSameAs = function (vertex, sameAs, successCallback) {
            sameAs.setType("same_as");
            addIdentification(
                vertex,
                sameAs,
                successCallback
            );
        };
        api.removeSameAs = function (vertex, sameAs, successCallback) {
            api.removeIdentification(
                vertex,
                sameAs,
                function () {
                    vertex.removeSameAs(sameAs);
                    if (successCallback != undefined) {
                        successCallback(
                            vertex,
                            sameAs
                        );
                    }
                    EventBus.publish(
                        '/event/ui/graph/vertex/same_as/removed',
                        [vertex, sameAs]
                    );
                }
            );
        };
        api.removeGenericIdentification = function (vertex, genericIdentification, callback) {
            api.removeIdentification(
                vertex,
                genericIdentification,
                function () {
                    vertex.removeGenericIdentification(genericIdentification);
                    if (callback != undefined) {
                        callback(
                            vertex,
                            genericIdentification
                        );
                    }
                    EventBus.publish(
                        '/event/ui/graph/vertex/generic_identification/removed',
                        [vertex, genericIdentification]
                    );
                }
            );
        };
        api.addGenericIdentification = function (vertex, identification, callback) {
            identification.setType("generic");
            addIdentification(
                vertex,
                identification,
                function () {
                    if (callback !== undefined) {
                        callback();
                    }
                }
            );
        };
        api.getSuggestions = function (vertex) {
            $.ajax({
                type: 'GET',
                url: vertex.getUri() + '/suggestions',
                dataType: 'json'
            }).success(function (jsonSuggestions) {
                var suggestions = getSuggestion().fromJsonArrayOfServer(
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
                data: getSuggestion().formatAllForServer(suggestions),
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
        function addIdentification(vertex, identification, callback) {
            GraphElement.addIdentification(
                vertex,
                identification,
                function (vertex, updatedIdentification) {
                    if (callback != undefined) {
                        callback();
                    }
                    EventBus.publish(
                        getEventBusKey(),
                        [vertex, updatedIdentification]
                    );
                }
            );
            function getEventBusKey() {
                switch (identification.getType()) {
                    case "type" :
                        return '/event/ui/graph/vertex/type/added';
                    case "same_as" :
                        return '/event/ui/graph/vertex/same_as/added';
                    default :
                        return '/event/ui/graph/vertex/generic_identification/added'
                }
            }
        }

        function setPrivacy(isPublic, vertex, callback) {
            $.ajax({
                type: isPublic ? 'POST' : 'DELETE',
                url: vertex.getUri() + '/public_access'
            }).success(callback);
        }

        function getSuggestion() {
            if (Suggestion === undefined) {
                Suggestion = require("triple_brain.suggestion");
            }
            return Suggestion;
        }

        function getVerticesUrl() {
            return UserService.currentUserUri() + "/graph/vertex"
        }
    }
);