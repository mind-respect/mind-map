/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element_server_facade"
], function (GraphElementServerFacade) {
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Object(
            serverFormat
        );
    };
    function Object(serverFormat) {
        this.serverFormat = serverFormat;
        GraphElementServerFacade.Self.apply(
            this
        );
        this.init(serverFormat.graphElement);
    }
    Object.prototype = new GraphElementServerFacade.Self;
    Object.prototype.getProperties = function () {
        var properties = [];
        if(undefined === this.serverFormat.properties){
            return properties
        }
        $.each(this.serverFormat.properties, function(){
            properties.push(
                GraphElementServerFacade.fromServerFormat(this)
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