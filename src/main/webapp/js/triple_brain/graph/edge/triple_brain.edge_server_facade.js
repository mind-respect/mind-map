/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element_server_facade",
    "triple_brain.vertex_server_facade"
], function (GraphElementServerFacade, VertexServerFacade) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(serverFormat);
    };
    api.buildObjectWithUriOfSelfSourceAndDestinationVertex = function (uri, sourceVertexUri, destinationVertexUri) {
        return {
            graphElement: GraphElementServerFacade.buildObjectWithUri(
                uri
            ),
            sourceVertex: VertexServerFacade.buildObjectWithUri(
                sourceVertexUri
            ),
            destinationVertex: VertexServerFacade.buildObjectWithUri(
                destinationVertexUri
            )
        };
    };
    api.Self = function () {};

    api.Self.prototype = new GraphElementServerFacade.Self;

    api.Self.prototype.init = function(edgeServerFormat){
        if (edgeServerFormat.sourceVertex !== undefined) {
            this.sourceVertex = getVertexServerFacade().fromServerFormat(
                edgeServerFormat.sourceVertex
            );
        }
        if (edgeServerFormat.destinationVertex !== undefined) {
            this.destinationVertex = getVertexServerFacade().fromServerFormat(
                edgeServerFormat.destinationVertex
            );
        }
        GraphElementServerFacade.Self.apply(
            this
        );
        GraphElementServerFacade.Self.prototype.init.call(
            this,
            edgeServerFormat.graphElement
        );
        return this;
    };

    api.Self.prototype.getSourceVertex = function () {
        return this.sourceVertex;
    };
    api.Self.prototype.getDestinationVertex = function () {
        return this.destinationVertex;
    };

    function getVertexServerFacade() {
        if (undefined === VertexServerFacade) {
            VertexServerFacade = require("triple_brain.vertex_server_facade");
        }
        return VertexServerFacade;
    }
    return api;
});