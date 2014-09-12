/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource_server_facade",
    "triple_brain.graph_element_server_facade"
], function(FriendlyResourceFacade, GraphElementServerFacade){
    "use strict";
    var api = {
        fromServerFormat : function (serverFormat) {
            return new Self(
                serverFormat
            );
        }
    };
    function Self(schemaServerFormat){
        this.schemaServerFormat = schemaServerFormat;
        this._properties = this._buildProperties();
        FriendlyResourceFacade.Self.apply(
            this
        );
        this.init(
            schemaServerFormat.friendlyResource
        );
    }
    Self.prototype = new FriendlyResourceFacade.Self;
    Self.prototype.getProperties = function(){
        return this._properties;
    };
    Self.prototype._buildProperties = function(){
        var properties = {};
        $.each(this.schemaServerFormat.properties, function(){
            var property = GraphElementServerFacade.fromServerFormat(this);
            properties[property.getUri()] = property;
        });
        return properties;
    };
    return api;
});
