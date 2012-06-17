require("Logger");

if (triple_brain.drawn_graph == undefined) {

    var logger = new Logger('triple_brain.drawn_graph');

    (function($) {
        var idURIUtils = triple_brain.id_uri;
        triple_brain.drawn_graph = {
            getWithDefaultCentralVertex: function() {
                var authenticatedUsername = triple_brain.authenticatedUser.user_name;
                var centralVertexId = idURIUtils.idFromUri(idURIUtils.baseURI + authenticatedUsername + '/default');
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices,
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    triple_brain.bus.local.topic('/event/ui/graph/drawing_info/updated/').publish(drawnGraph, centralVertexId);
                })
             },
            getWithNewCentralVertex: function(newCentralVertex) {
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + triple_brain.id_uri.encodedUriFromId(newCentralVertex.id()),
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    triple_brain.bus.local.topic('/event/ui/graph/drawing_info/updated/').publish(drawnGraph, newCentralVertex.id());
                })
            },
            getFromNewCentralVertexUri: function(newCentralVertexUri) {
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + triple_brain.id_uri.encodeUri(newCentralVertexUri),
                    dataType: 'json'
                }).success(function(drawnGraph) {
                        triple_brain.bus.local.topic('/event/ui/graph/drawing_info/updated/').publish(drawnGraph, triple_brain.id_uri.idFromUri(newCentralVertexUri));
                    })
            }
        }

        function mindMapURI(){
            return encodeURIComponent(
                idURIUtils.baseURI +
                    triple_brain.authenticatedUser.user_name +
                    "/mind_map"
            )
        }

    })(jQuery);

}