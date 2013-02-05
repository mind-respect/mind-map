/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.config",
    "triple_brain.mind_map_info"
],
    function($, Config, MindMapInfo){
        var api = {};
        api.calculateUsingCentralVertexEncodedUriAndDepth = function(centralVertexEncodedUri, depth, callback){
            $.ajax({
                type:'GET',
                url:Config.links.app + '/service/drawn_graph/' + MindMapInfo.uri() + "/" + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(callback)
        };
        return api;
    }
);