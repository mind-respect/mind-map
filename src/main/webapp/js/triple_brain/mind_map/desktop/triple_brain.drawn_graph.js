require("Logger");

if (triple_brain.drawn_graph == undefined) {

    var logger = new Logger('triple_brain.drawn_graph');

    (function($) {
        triple_brain.drawn_graph = {
            getWithDefaultCentralVertex: function() {
                var centralVertexId = triple_brain.id_uri.idFromUri('http://www.triple_brain.org/roger_lamothe/element_1');
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + depthOfSubVertices,
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    triple_brain.bus.local.topic('/event/ui/graph/drawing_info/updated/').publish(drawnGraph, centralVertexId);
                })
             },
            getWithNewCentralVertex: function(newCentralVertex) {
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + depthOfSubVertices + '/' + triple_brain.id_uri.encodedUriFromId(newCentralVertex.id()),
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    triple_brain.bus.local.topic('/event/ui/graph/drawing_info/updated/').publish(drawnGraph, newCentralVertex.id());
                })
             }
        }

    })(jQuery);

}