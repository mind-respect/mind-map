define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.ui.triple",
    "triple_brain.suggestion",
    "triple_brain.graph_element"
],
    function (require, $, EventBus, Triple, Suggestion, GraphElement) {
        var api = {};
        api.addRelationAndVertexToVertex = function (vertex, callback) {
            var dummyPosition = {
                x:0,
                y:0
            };
            api.addRelationAndVertexAtPositionToVertex(
                vertex,
                dummyPosition,
                callback
            );
        };
        api.addRelationAndVertexAtPositionToVertex = function (vertex, newVertexPosition, callback) {
            $.ajax({
                type:'POST',
                url:vertex.getUri(),
                dataType:'json'
            }).success(function (tripleJson) {
                    var triple = Triple.createUsingServerTripleAndNewVertexPosition(
                        vertex,
                        tripleJson,
                        newVertexPosition
                    );
                    if (callback != undefined) {
                        callback(triple, tripleJson);
                    }
                });
        };
        api.remove = function (vertex, callback) {
            $.ajax({
                type:'DELETE',
                url:vertex.getUri()
            }).success(function () {
                    var vertexUri = vertex.getUri();
                    callback(vertex);
                    EventBus.publish(
                        '/event/ui/graph/vertex/deleted/',
                        vertexUri
                    );
                })
        };
        api.updateLabel = function (vertex, label, callback) {
            $.ajax({
                type:'POST',
                url:vertex.getUri() + '/label?label=' + label
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
                type:'POST',
                url:vertex.getUri() + '/note',
                data:note,
                contentType:"text/plain"
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
            type.type = "type";
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
            sameAs.type = "same_as";
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
        api.getSuggestions = function (vertex) {
            $.ajax({
                type:'GET',
                url:vertex.getUri() + '/suggestions',
                dataType:'json'
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
                type:'POST',
                url:vertex.getUri() + '/suggestions',
                data:getSuggestion().formatAllForServer(suggestions),
                contentType:'application/json;charset=utf-8'
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
        function addIdentification(vertex, identification, successCallback) {
            GraphElement.addIdentification(
                vertex,
                identification,
                function () {
                    if (successCallback != undefined) {
                        successCallback();
                    }
                    var eventBusMessage = identification.type === "type" ?
                        '/event/ui/graph/vertex/type/added' :
                        '/event/ui/graph/vertex/same_as/added';
                    EventBus.publish(
                        eventBusMessage,
                        [vertex, identification]
                    );
                }
            );
        }

        function setPrivacy(isPublic, vertex, callback) {
            $.ajax({
                type:isPublic ? 'POST' : 'DELETE',
                url:vertex.getUri() + '/public_access'
            }).success(callback);
        }

        function getSuggestion() {
            if (Suggestion === undefined) {
                Suggestion = require("triple_brain.suggestion");
            }
            return Suggestion;
        }

        return api;
    }
);