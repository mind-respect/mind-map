if (triple_brain.vertex == undefined) {
    (function($) {
        var eventBus = triple_brain.event_bus;
        triple_brain.vertex = {
             addRelationAndVertexAtPositionToVertex: function(vertex, newVertexPosition, callback) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/' + triple_brain.id_uri.encodedUriFromId(vertex.id()),
                    dataType: 'json'
                }).success(function(statementNewRelation) {
                    if(callback != undefined){
                        callback.call(this, statementNewRelation);
                    }
                        eventBus.publish(
                            '/event/ui/graph/vertex_and_relation/added/',
                            [statementNewRelation, newVertexPosition]
                        );
                })
             },
             remove: function(vertex) {
                $.ajax({
                    type: 'DELETE',
                    url: options.ws.app + '/service/vertex/' + triple_brain.id_uri.encodedUriFromId(vertex.id())
                }).success(function() {
                        eventBus.publish(
                        '/event/ui/graph/vertex/deleted/',
                        vertex
                    )
                })
             },
             updateLabel: function(vertex, label) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/label/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?label=' + label,
                    dataType: 'json'
                }).success(function() {
                        eventBus.publish(
                        '/event/ui/graph/vertex/label/updated',
                        vertex
                    )
                })
             },
             updateType: function(vertex, typeUri) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/type/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?type_uri=' + typeUri,
                    dataType: 'json'
                }).success(function() {
                    eventBus.publish(
                        '/event/ui/graph/vertex/type/updated',
                        [vertex, typeUri]
                    );
                })
             },
             updateSameAs: function(vertex, sameAsUri) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/same_as/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?same_as_uri=' + sameAsUri,
                    dataType: 'json'
                }).success(function() {
                    eventBus.publish(
                        '/event/ui/graph/vertex/same_as/updated',
                        [vertex, sameAsUri]
                    );
                })
             }
        }

    })(jQuery);

}