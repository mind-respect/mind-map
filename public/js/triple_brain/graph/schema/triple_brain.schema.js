/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.graph_element"
], function($, FriendlyResource, GraphElement){
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Schema(
            serverFormat
        );
    };
    api.fromSearchResult = function(searchResult){
        searchResult.friendlyResource = searchResult.graphElement.friendlyResource;
        return new Schema(
            searchResult
        );
    };
    api.fromServerList = function(serverFormatList){
        var schemas = [];
        $.each(serverFormatList, function(){
            schemas.push(
                new Schema(this)
            );
        });
        return schemas;
    };
    function Schema(schemaServerFormat){
        this.schemaServerFormat = schemaServerFormat;
        this._properties = this._buildProperties();
        GraphElement.Self.apply(
            this
        );
        this.init(
            schemaServerFormat.graphElement
        );
    }
    Schema.prototype = new GraphElement.Self();
    Schema.prototype.getProperties = function(){
        return this._properties;
    };
    Schema.prototype._buildProperties = function(){
        var properties = {};
        if(!this.schemaServerFormat.properties){
            return properties;
        }
        $.each(this.schemaServerFormat.properties, function(){
            var property = GraphElement.fromServerFormat(this);
            properties[property.getUri()] = property;
        });
        return properties;
    };
    Schema.prototype.getPropertiesName = function () {
        var propertiesName = [];
        $.each(this.getProperties(), function(){
            propertiesName.push(this.getLabel());
        });
        return propertiesName;
    };
    Schema.prototype.hasProperties = function(){
        return this.getProperties().length > 0;
    };
    return api;
});
