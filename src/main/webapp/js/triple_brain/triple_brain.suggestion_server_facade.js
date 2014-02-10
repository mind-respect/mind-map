/*
 * Copyright Mozilla Public License 1.1
 */
define([

], function(){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    return api;
    function Object(serverFormat){
        this.getLabel = function(){
            return serverFormat.label;
        };
        this.getComment = function(){
            return serverFormat.comment;
        };
    }
});
