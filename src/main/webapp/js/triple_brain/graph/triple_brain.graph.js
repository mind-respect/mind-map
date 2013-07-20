/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function($){
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback){
            $.ajax({
                type:'GET',
                url: api.graphUriForCentralVertexUriAndDepth(centralVertexUri, depth)
            }).success(callback);
        };
        api.graphUriForCentralVertexUriAndDepth = function(centralVertexUri, depth){
            return centralVertexUri  +'/surround_graph/' + depth;
        };
        return api;
    }
);
