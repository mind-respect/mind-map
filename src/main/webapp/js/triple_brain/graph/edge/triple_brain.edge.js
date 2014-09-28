/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element",
    "triple_brain.vertex"
], function (GraphElement, Vertex) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(serverFormat);
    };
    api.buildObjectWithUriOfSelfSourceAndDestinationVertex = function (uri, sourceVertexUri, destinationVertexUri) {
        return {
            graphElement: GraphElement.buildObjectWithUri(
                uri
            ),
            sourceVertex: Vertex.buildObjectWithUri(
                sourceVertexUri
            ),
            destinationVertex: Vertex.buildObjectWithUri(
                destinationVertexUri
            )
        };
    };
    api.Self = function () {};

    api.Self.prototype = new GraphElement.Self;

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
        GraphElement.Self.apply(
            this
        );
        GraphElement.Self.prototype.init.call(
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
        if (undefined === Vertex) {
            Vertex = require("triple_brain.vertex");
        }
        return Vertex;
    }
    return api;
});