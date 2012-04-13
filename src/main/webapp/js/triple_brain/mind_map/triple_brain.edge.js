
if (triple_brain.edge == undefined) {

    (function($) {
        triple_brain.edge = {
            add: function(sourceVertex, destinationVertex) {
                var sourceVertexURI = triple_brain.id_uri.encodedUriFromId(sourceVertex.id());
                var destinationVertexURI = triple_brain.id_uri.encodedUriFromId(destinationVertex.id());
                var response = $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/edge/' + sourceVertexURI  + '/' + destinationVertexURI
                }).success(function() {
                    var responseURI = response.getResponseHeader("Location");
                    var edgeJSON = {};
                    edgeJSON.id = decodeURIComponent(
                                    responseURI.substring(responseURI.lastIndexOf("/") + 1)
                                   );
                    var arrowLine = triple_brain.ui.arrow_line.ofSourceAndDestinationVertex(
                        sourceVertex,
                        destinationVertex
                    );
                    edgeJSON.arrowLineStartPoint = arrowLine.segment().startPoint;
                    edgeJSON.arrowLineEndPoint = arrowLine.segment().endPoint;

                    edgeJSON.source_vertex_id = triple_brain.id_uri.uriFromId(
                                        sourceVertex.id());
                    edgeJSON.destination_vertex_id = triple_brain.id_uri.uriFromId(
                                            destinationVertex.id());

                    edgeJSON.label = triple_brain.ui.edge.EMPTY_LABEL;
                    triple_brain.bus.local.topic('/event/ui/graph/relation/added/').publish(edgeJSON);
                })
             },
            remove: function(edge) {
                $.ajax({
                    type: 'DELETE',
                    url: options.ws.app + '/service/edge/' + triple_brain.id_uri.encodedUriFromId(edge.id())
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/relation/deleted').publish(edge);
                })
             },
             updateLabel: function(edge, label) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/edge/label/' + triple_brain.id_uri.encodedUriFromId(edge.id()) + '?label=' + label,
                    dataType: 'json'
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/edge/label/updated').publish(edge);
                })
             }
        }

    })(jQuery);

}