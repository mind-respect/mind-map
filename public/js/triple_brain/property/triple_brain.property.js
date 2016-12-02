/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element"
], function(GraphElement){
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Property(
            serverFormat
        );
    };
    function Property(propertyServerFormat){
        GraphElement.GraphElement.apply(
            this
        );
        this.init(
            propertyServerFormat
        );
    }
    Property.prototype = new GraphElement.GraphElement();

    Property.prototype.setSchema = function (schema) {
        this.schema = schema;
    };
    Property.prototype.getSchema = function(){
        return this.schema;
    };
    Property.prototype.isPublic = function(){
        return true;
    };
    return api;
});
