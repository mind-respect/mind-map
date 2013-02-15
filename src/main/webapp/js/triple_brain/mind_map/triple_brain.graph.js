/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.config",
    "triple_brain.mind_map_info"
],
    function($, IdUriUtils, Config, MindMapInfo){
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback){
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url:Config.links.app + '/service/graph/' + MindMapInfo.uri() + "/" + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(callback);
        };
        return api;
    }
);
