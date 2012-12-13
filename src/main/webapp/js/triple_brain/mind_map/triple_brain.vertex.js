define([
    "require",
    "jquery",
    "triple_brain.config",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.ui.triple",
    "triple_brain.suggestion"
],
    function (require, $, Config, EventBus, IdUriUtils, Triple, Suggestion) {
        var api = {};
        api.addRelationAndVertexAtPositionToVertex = function (vertex, newVertexPosition, successCallback) {
            $.ajax({
                type:'POST',
                url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()),
                dataType:'json'
            }).success(function (tripleJson) {
                    var triple = Triple.fromServerStatementAndNewVertexPosition(
                        tripleJson,
                        newVertexPosition
                    )
                    if (successCallback != undefined) {
                        successCallback.call(this, triple);
                    }
                })
        };
        api.remove = function (vertex) {
            $.ajax({
                type:'DELETE',
                url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId())
            }).success(function () {
                    EventBus.publish(
                        '/event/ui/graph/vertex/deleted/',
                        vertex
                    )
                })
        };
        api.updateLabel = function (vertex, label) {
            $.ajax({
                type:'POST',
                url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/label?label=' + label,
                dataType:'json'
            }).success(function () {
                    EventBus.publish(
                        '/event/ui/graph/vertex/label/updated',
                        vertex
                    )
                })
        };
        api.addType = function (vertex, type, successCallback) {
            type.listenForUpdates(addTypeWhenListenerReady);
            function addTypeWhenListenerReady() {
                $.ajax({
                    type:'POST',
                    url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/type',
                    dataType:'json',
                    data:type.serverFormat(),
                    contentType:'application/json;charset=utf-8'
                }).success(function () {
                        vertex.addType(type);
                        if (successCallback != undefined) {
                            successCallback(vertex,type);
                        }
                        EventBus.publish(
                            '/event/ui/graph/vertex/type/added',
                            [vertex, type]
                        );
                    })
            }
        };
        api.removeIdentification = function (vertex, identification, successCallback) {
            $.ajax({
                type:'DELETE',
                url:Config.links.app +
                    '/service/vertex/' +
                    IdUriUtils.encodedUriFromGraphElementId(vertex.getId())
                    + '/identification/'
                    + IdUriUtils.encodeUri(identification.uri()),
                dataType:'json'
            }).success(successCallback);
        };
        api.removeType = function (vertex, typeToRemove, successCallback) {
            api.removeIdentification(
                vertex,
                typeToRemove,
                function () {
                    vertex.removeType(typeToRemove);
                    if (successCallback != undefined) {
                        successCallback.call(
                            this,
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
            sameAs.listenForUpdates(addSameAsWhenListenerReady);
            function addSameAsWhenListenerReady() {
                $.ajax({
                    type:'POST',
                    url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/same_as',
                    dataType:'json',
                    data:sameAs.serverFormat(),
                    contentType:'application/json;charset=utf-8'
                }).success(function () {
                        vertex.addSameAs(sameAs);
                        if (successCallback != undefined) {
                            successCallback.call(
                                this,
                                vertex,
                                sameAs
                            );
                        }
                        EventBus.publish(
                            '/event/ui/graph/vertex/same_as/added',
                            [vertex, sameAs]
                        );
                    })
            }
        };
        api.removeSameAs = function (vertex, sameAs, successCallback) {
            api.removeIdentification(
                vertex,
                sameAs,
                function () {
                    vertex.removeSameAs(sameAs);
                    if (successCallback != undefined) {
                        successCallback.call(
                            this,
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
                url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/suggestions',
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
                })
        }
        api.addSuggestions = function (vertex, suggestions) {
            $.ajax({
                type:'POST',
                url:Config.links.app + '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/suggestions',
                dataType:'json',
                data:getSuggestion().formatAllForServer(suggestions),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    vertex.addSuggestions(suggestions);
                    EventBus.publish(
                        '/event/ui/graph/vertex/suggestions/updated',
                        [vertex, suggestions]
                    );
                })
        };
        function getSuggestion(){
            if(Suggestion === undefined){
                Suggestion = require("triple_brain.suggestion");
            }
            return Suggestion;
        }
        return api;
    }
);