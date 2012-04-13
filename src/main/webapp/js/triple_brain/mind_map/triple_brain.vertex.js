
if (triple_brain.vertex == undefined) {

    (function($) {
        triple_brain.vertex = {
             addRelationAndVertexAtPositionToVertex: function(vertex, newVertexPosition, callback) {
                var response = $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/' + triple_brain.id_uri.encodedUriFromId(vertex.id()),
                    dataType: 'json'
                }).success(function(statementNewRelation) {
                    if(callback != undefined){
                        callback.call(this, statementNewRelation);
                    }
                    triple_brain.bus.local.topic('/event/ui/graph/vertex_and_relation/added/').publish(statementNewRelation, newVertexPosition);
                })
             },
             remove: function(vertex) {
                $.ajax({
                    type: 'DELETE',
                    url: options.ws.app + '/service/vertex/' + triple_brain.id_uri.encodedUriFromId(vertex.id())
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/vertex/deleted/').publish(vertex);
                })
             },
             updateLabel: function(vertex, label) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/label/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?label=' + label,
                    dataType: 'json'
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/vertex/label/updated').publish(vertex);
                })
             },
             updateType: function(vertex, typeUri) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/type/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?type_uri=' + typeUri,
                    dataType: 'json'
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/vertex/type/updated').publish(vertex, typeUri);
                })
             },
             updateSameAs: function(vertex, sameAsUri) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/vertex/same_as/' + triple_brain.id_uri.encodedUriFromId(vertex.id()) + '?same_as_uri=' + sameAsUri,
                    dataType: 'json'
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/vertex/same_as/updated').publish(vertex, sameAsUri);
                })
             }
        }

    })(jQuery);

}