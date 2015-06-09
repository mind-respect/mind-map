/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element"
], function(GraphElement){
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Self(
            serverFormat
        );
    };
    function Self(propertyServerFormat){
        GraphElement.Self.apply(
            this
        );
        this.init(
            propertyServerFormat
        );
    }
    Self.prototype = new GraphElement.Self();

    Self.prototype.setSchema = function (schema) {
        this.schema = schema;
    };
    Self.prototype.getSchema = function(){
        return this.schema;
    };
    return api;
});
