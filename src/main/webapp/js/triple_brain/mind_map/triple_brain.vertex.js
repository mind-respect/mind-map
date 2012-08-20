if (triple_brain.vertex == undefined) {
    (function ($) {
        var eventBus = triple_brain.event_bus;
        var idUriStatic = triple_brain.id_uri;
        var vertexService = triple_brain.vertex = {};
        vertexService.addRelationAndVertexAtPositionToVertex = function (vertex, newVertexPosition, successCallback) {
            $.ajax({
                type:'POST',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId()),
                dataType:'json'
            }).success(function (tripleJson) {
                    if (successCallback != undefined) {
                        successCallback.call(this, tripleJson);
                    }
                    var triple = triple_brain.ui.triple.fromServerStatementAndNewVertexPosition(
                        tripleJson,
                        newVertexPosition
                    )
                    eventBus.publish(
                        '/event/ui/graph/vertex_and_relation/added/',
                        [triple]
                    );
                })
        };
        vertexService.remove = function (vertex) {
            $.ajax({
                type:'DELETE',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId())
            }).success(function () {
                    eventBus.publish(
                        '/event/ui/graph/vertex/deleted/',
                        vertex
                    )
                })
        };
        vertexService.updateLabel = function (vertex, label) {
            $.ajax({
                type:'POST',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId()) + '/label?label=' + label,
                dataType:'json'
            }).success(function () {
                    eventBus.publish(
                        '/event/ui/graph/vertex/label/updated',
                        vertex
                    )
                })
        };
        vertexService.addType = function (vertex, type, successCallback) {
            $.ajax({
                type:'POST',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId()) + '/type',
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
                })
        };
        vertexService.removeIdentification = function(vertex, identification, successCallback){
            $.ajax({
                type:'DELETE',
                url:options.ws.app +
                    '/service/vertex/' +
                    idUriStatic.encodedUriFromGraphElementId(vertex.getId())
                    + '/identification/'
                    + idUriStatic.encodeUri(identification.uri()),
                dataType:'json'
            }).success(successCallback);
        };
        vertexService.removeType = function (vertex, typeToRemove, successCallback) {
            vertexService.removeIdentification(
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
                }
            );
        };
        vertexService.addSameAs = function (vertex, sameAs, successCallback) {
            $.ajax({
                type:'POST',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId()) + '/same_as',
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
                })
        };
        vertexService.removeSameAs = function (vertex, sameAs, successCallback) {
            vertexService.removeIdentification(
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
                }
            );
        };
        vertexService.setSuggestions = function (vertex, suggestions) {
            $.ajax({
                type:'POST',
                url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromGraphElementId(vertex.getId()) + '/suggestions',
                dataType:'json',
                data:triple_brain.suggestion.formatAllForServer(suggestions),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    vertex.setSuggestions(suggestions);
                })
        };

    })(jQuery);

}