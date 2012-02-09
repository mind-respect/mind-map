
if (triple_brain.edge == undefined) {

    (function($) {
        triple_brain.edge = {
            add: function(sourceVertex, destinationVertex) {
                var response = $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/edge/' + sourceVertex.id() + '/' + destinationVertex.id()
                }).success(function() {
                    var responseURI = response.getResponseHeader("Location");
                    var edgeJSON = {};
                    edgeJSON.id = responseURI.substring(responseURI.lastIndexOf("/") + 1);
                    var arrowLine = triple_brain.ui.arrow_line.ofSourceAndDestinationVertex(
                        sourceVertex,
                        destinationVertex
                    );
                    edgeJSON.arrowLineStartPoint = arrowLine.segment().startPoint;
                    edgeJSON.arrowLineEndPoint = arrowLine.segment().endPoint;

                    edgeJSON.source_vertex_id = sourceVertex.id();
                    edgeJSON.destination_vertex_id = destinationVertex.id();

                    edgeJSON.label = triple_brain.ui.edge.EMPTY_LABEL;
                    triple_brain.bus.local.topic('/event/ui/graph/relation/added/').publish(edgeJSON);
                })
             },
            remove: function(edge) {
                $.ajax({
                    type: 'DELETE',
                    url: options.ws.app + '/service/edge/' + edge.id()
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/relation/deleted').publish(edge);
                })
             },
             updateLabel: function(edge, label) {
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/edge/label/' + edge.id() + '?label=' + label,
                    dataType: 'json'
                }).success(function() {
                    triple_brain.bus.local.topic('/event/ui/graph/edge/label/updated').publish(edge);
                })
             }
        }

    })(jQuery);

}