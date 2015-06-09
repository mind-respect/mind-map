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
        return new Self(
            serverFormat
        );
    };
    api.fromSearchResult = function(searchResult){
        searchResult.friendlyResource = searchResult.graphElement.friendlyResource;
        return new Self(
            searchResult
        );
    };
    function Self(schemaServerFormat){
        this.schemaServerFormat = schemaServerFormat;
        this._properties = this._buildProperties();
        GraphElement.Self.apply(
            this
        );
        this.init(
            schemaServerFormat.graphElement
        );
    }
    Self.prototype = new GraphElement.Self();
    Self.prototype.getProperties = function(){
        return this._properties;
    };
    Self.prototype._buildProperties = function(){
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
    Self.prototype.getPropertiesName = function () {
        var propertiesName = [];
        $.each(this.getProperties(), function(){
            propertiesName.push(this.getLabel());
        });
        return propertiesName;
    };
    Self.prototype.hasProperties = function(){
        return this.getProperties().length > 0;
    };
    return api;
});
