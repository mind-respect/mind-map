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
    Object.prototype.getPropertiesName = function () {
        return undefined === this.serverFormat.propertiesName ?
            [] :
            this.serverFormat.propertiesName;
    };
    Object.prototype.isVertex = function () {
        return true;
    };
    return api;
});