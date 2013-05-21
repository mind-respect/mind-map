define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.user"
],
    function(require, $, EventBus, IdUriUtils, UserService) {
        var api = {
            add: function(sourceVertex, destinationVertex, callback) {
                var Edge = require("triple_brain.ui.edge");
                var sourceVertexUri = IdUriUtils.encodeUri(sourceVertex.getUri());
                var destinationVertexUri = IdUriUtils.encodeUri(destinationVertex.getUri());
                var response = $.ajax({
                    type: 'POST',
                    url: edgesUrl() +
                        '?sourceVertexId=' + sourceVertexUri  +
                        '&destinationVertexId=' + destinationVertexUri
                }).success(function() {
                        var responseUri = response.getResponseHeader("Location");
                        var edgeServerFormatted = {};
                        edgeServerFormatted.id = responseUri;
                        edgeServerFormatted.source_vertex_id = sourceVertex.getUri();
                        edgeServerFormatted.destination_vertex_id = destinationVertex.getUri();
                        edgeServerFormatted.label = Edge.EMPTY_LABEL;
                        callback(edgeServerFormatted);
                    })
            },
            remove: function(edge) {
                $.ajax({
                    type: 'DELETE',
                    url: edge.getUri()
                }).success(function() {
                        EventBus.publish(
                            '/event/ui/graph/relation/deleted',
                            edge
                        )
                    })
            },
            updateLabel: function(edge, label) {
                $.ajax({
                    type: 'POST',
                    url: edge.getUri() + "/label" + '?label=' + label,
                    dataType: 'json'
                }).success(function() {
                        EventBus.publish(
                            '/event/ui/graph/edge/label/updated',
                            edge
                        );
                    })
            }
        }
        return api;
        function edgesUrl(){
            return UserService.currentUserUri() + "/graph/edge";
        }
    }
);