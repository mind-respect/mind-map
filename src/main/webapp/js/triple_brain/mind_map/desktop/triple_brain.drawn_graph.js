define([
    "jquery",
    "triple_brain/triple_brain.id_uri",
    "triple_brain/triple_brain.event_bus",
    "triple_brain/mind_map/triple_brain.user",
    "triple_brain/triple_brain.config"
],
    function ($, IdUriUtils, EventBus, UserService, Config) {
        return {
            getWithDefaultCentralVertex:function () {
                EventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var username = UserService.authenticatedUserInCache().user_name;
                var centralVertexId = IdUriUtils.graphElementIdFromUri(IdUriUtils.baseUri + username + '/default');
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type:'GET',
                    url:Config.links.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices,
                    dataType:'json'
                }).success(function (drawnGraph) {
                        EventBus.publish(
                            '/event/ui/graph/drawing_info/updated/',
                            [drawnGraph, centralVertexId]
                        );
                    })
            },
            getWithNewCentralVertex:function (newCentralVertex) {
                EventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type:'GET',
                    url:Config.links.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + IdUriUtils.encodedUriFromGraphElementId(newCentralVertex.getId()),
                    dataType:'json'
                }).success(function (drawnGraph) {
                        EventBus.publish(
                            '/event/ui/graph/drawing_info/updated/',
                            [drawnGraph, newCentralVertex.getId()]
                        );
                    })
            },
            getFromNewCentralVertexUri:function (newCentralVertexUri) {
                EventBus.publish('/event/ui/graph/drawing_info/about_to/update', []);
                var depthOfSubVertices = $("#sub-vertices-depth-slider").slider('value');
                $.ajax({
                    type:'GET',
                    url:Config.links.app + '/service/drawn_graph/' + mindMapURI() + "/" + depthOfSubVertices + '/' + IdUriUtils.encodeUri(newCentralVertexUri),
                    dataType:'json'
                }).success(function (drawnGraph) {
                        EventBus.publish(
                            '/event/ui/graph/drawing_info/updated/',
                            [
                                drawnGraph,
                                IdUriUtils.graphElementIdFromUri(newCentralVertexUri)
                            ]
                        )
                    })
            }
        }

        function mindMapURI() {
            var username = UserService.authenticatedUserInCache().user_name;
            return encodeURIComponent(
                IdUriUtils.baseUri +
                    username +
                    "/mind_map"
            )
        }

    }
)
