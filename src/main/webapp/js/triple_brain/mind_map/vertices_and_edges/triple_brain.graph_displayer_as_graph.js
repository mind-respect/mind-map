/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.config",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri"
],
    function($, Config, MindMapInfo, IdUriUtils){
        var api = {};
        api.displayUsingDepthAndCentralVertexUri = function(centralVertexUri, depth, callback){
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url:Config.links.app + '/service/drawn_graph/' + MindMapInfo.uri() + "/" + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(callback)
        };
        return api;
    }
);