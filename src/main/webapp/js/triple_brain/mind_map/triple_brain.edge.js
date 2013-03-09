define([
    "require",
    "jquery",
    "triple_brain.config",
    "triple_brain.event_bus",
    "triple_brain.id_uri"
],
    function(require, $, Config, EventBus, IdUriUtils) {
        var api = {
            add: function(sourceVertex, destinationVertex, callback) {
                var Edge = require("triple_brain.ui.edge");
                var sourceVertexURI = IdUriUtils.encodedUriFromGraphElementId(sourceVertex.getId());
                var destinationVertexURI = IdUriUtils.encodedUriFromGraphElementId(destinationVertex.getId());
                var response = $.ajax({
                    type: 'POST',
                    url: Config.links.app + '/service/edge/' + sourceVertexURI  + '/' + destinationVertexURI
                }).success(function() {
                        var responseURI = response.getResponseHeader("Location");
                        var edgeJSON = {};
                        edgeJSON.id = decodeURIComponent(
                            responseURI.substring(responseURI.lastIndexOf("/") + 1)
                        );

                        edgeJSON.source_vertex_id = IdUriUtils.uriFromGraphElementId(
                            sourceVertex.getId());
                        edgeJSON.destination_vertex_id = IdUriUtils.uriFromGraphElementId(
                            destinationVertex.getId());

                        edgeJSON.label = Edge.EMPTY_LABEL;
                        callback(edgeJSON);
                    })
            },
            remove: function(edge) {
                $.ajax({
                    type: 'DELETE',
                    url: Config.links.app + '/service/edge/' + IdUriUtils.encodedUriFromGraphElementId(edge.id())
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
                    url: Config.links.app + '/service/edge/label/' + IdUriUtils.encodedUriFromGraphElementId(edge.id()) + '?label=' + label,
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
    }
);