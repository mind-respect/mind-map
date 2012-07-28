if (triple_brain.drawn_graph == undefined) {

    (function($) {
        var idURIUtils = triple_brain.id_uri;
        var eventBus = triple_brain.event_bus;
        triple_brain.drawn_graph = {
            getWithDefaultCentralVertex: function() {
                eventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var authenticatedUsername = triple_brain.authenticatedUser.user_name;
                var centralVertexId = idURIUtils.idFromUri(idURIUtils.baseURI + authenticatedUsername + '/default');
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices,
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    eventBus.publish(
                        '/event/ui/graph/drawing_info/updated/',
                        [drawnGraph, centralVertexId]
                    );
                })
             },
            getWithNewCentralVertex: function(newCentralVertex) {
                eventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + triple_brain.id_uri.encodedUriFromId(newCentralVertex.getId()),
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    eventBus.publish(
                        '/event/ui/graph/drawing_info/updated/',
                        [drawnGraph, newCentralVertex.getId()]
                    );
                })
            },
            getFromNewCentralVertexUri: function(newCentralVertexUri) {
                eventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + triple_brain.id_uri.encodeUri(newCentralVertexUri),
                    dataType: 'json'
                }).success(function(drawnGraph) {
                    eventBus.publish(
                        '/event/ui/graph/drawing_info/updated/',
                        [
                            drawnGraph,
                            triple_brain.id_uri.idFromUri(newCentralVertexUri)
                        ]
                    )
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