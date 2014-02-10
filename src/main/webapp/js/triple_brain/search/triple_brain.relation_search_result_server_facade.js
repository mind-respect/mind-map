/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.edge_server_facade"
], function(EdgeServerFacade){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    function Object(serverFormat){
        EdgeServerFacade.Object.apply(
            this, [serverFormat.edge]
        );
        this.isVertex = function(){
            return false;
        };
    }
    return api;
});