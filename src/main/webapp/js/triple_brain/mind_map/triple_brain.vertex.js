define([
    "jquery",
    "triple_brain.config",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.ui.triple",
    "triple_brain.suggestion"
],
    function ($, Config, EventBus, IdUriUtils, Triple, Suggestion) {
        var api = {};
        api.addRelationAndVertexAtPositionToVertex = function (vertex, newVertexPosition, successCallback) {
            $.ajax({
                type:'POST',
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()),
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
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId())
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
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/label?label=' + label,
                dataType:'json'
            }).success(function () {
                    EventBus.publish(
                        '/event/ui/graph/vertex/label/updated',
                        vertex
                    )
                })
        };
        api.addType = function (vertex, type, successCallback) {
            $.ajax({
                type:'POST',
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/type',
                dataType:'json',
                data:type.serverFormat(),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    vertex.addType(type);
                    if (successCallback != undefined) {
                        successCallback.call(
                            this,
                            vertex,
                            type
                        );
                    }
                    EventBus.publish(
                        '/event/ui/graph/vertex/type/added',
                        [vertex, type]
                    );
                })
        };
        api.removeIdentification = function(vertex, identification, successCallback){
            $.ajax({
                type:'DELETE',
                url:Config.links.app+
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
                function(){
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
            $.ajax({
                type:'POST',
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/same_as',
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
        };
        api.removeSameAs = function (vertex, sameAs, successCallback) {
            api.removeIdentification(
                vertex,
                sameAs,
                function(){
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
        api.setSuggestions = function (vertex, suggestions) {
            $.ajax({
                type:'POST',
                url:Config.links.app+ '/service/vertex/' + IdUriUtils.encodedUriFromGraphElementId(vertex.getId()) + '/suggestions',
                dataType:'json',
                data:Suggestion.formatAllForServer(suggestions),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    vertex.setSuggestions(suggestions);
                    EventBus.publish(
                        '/event/ui/graph/vertex/suggestions/updated',
                        [vertex, suggestions]
                    );
                })
        };
        return api;
    }
);