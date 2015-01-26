/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource",
    "triple_brain.graph_element"
], function(FriendlyResource, GraphElement){
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
        FriendlyResource.Self.apply(
            this
        );
        this.init(
            schemaServerFormat.friendlyResource
        );
    }
    Self.prototype = new FriendlyResource.Self;
    Self.prototype.getProperties = function(){
        return this._properties;
    };
    Self.prototype._buildProperties = function(){
        var properties = {};
        $.each(this.schemaServerFormat.properties, function(){
            var property = GraphElement.fromServerFormat(this);
            properties[property.getUri()] = property;
        });
        return properties;
    };
    return api;
});
