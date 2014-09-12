/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        EdgeServerFacade.Self.apply(
            this
        );
        this.init(serverFormat.edge);
    }
    Object.prototype = new EdgeServerFacade.Self;
    Object.prototype.isVertex = function(){
        return false;
    };
    return api;
});