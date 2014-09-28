/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element"
], function (GraphElement) {
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Object(
            serverFormat
        );
    };
    function Object(serverFormat) {
        this.serverFormat = serverFormat;
        GraphElement.Self.apply(
            this
        );
        this.init(serverFormat.graphElement);
    }
    Object.prototype = new GraphElement.Self;
    Object.prototype.getProperties = function () {
        var properties = [];
        if(undefined === this.serverFormat.properties){
            return properties
        }
        $.each(this.serverFormat.properties, function(){
            properties.push(
                GraphElement.fromServerFormat(this)
            );
        });
        return properties;
    };
    Object.prototype.getPropertiesName = function () {
        var propertiesName = [];
        $.each(this.getProperties(), function(){
            propertiesName.push(this.getLabel());
        });
        return propertiesName;
    };
    Object.prototype.isVertex = function () {
        return true;
    };
    return api;
});