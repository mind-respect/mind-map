/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.user"
],
    function($, IdUriUtils, UserService){
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback){
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url:graphUri()  +'/' + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(callback);
        };
        return api;

        function graphUri(){
            return UserService.currentUserUri() + "/graph";
        }
    }
);
