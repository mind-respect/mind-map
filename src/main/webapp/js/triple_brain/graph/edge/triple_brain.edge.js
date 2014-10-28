/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element",
    "triple_brain.friendly_resource"
], function (GraphElement, FriendlyResource) {
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
            sourceVertex: FriendlyResource.buildObjectWithUri(
                sourceVertexUri
            ),
            destinationVertex: FriendlyResource.buildObjectWithUri(
                destinationVertexUri
            )
        };
    };
    api.Self = function () {};

    api.Self.prototype = new GraphElement.Self;

    api.Self.prototype.init = function(edgeServerFormat){
        if (edgeServerFormat.sourceVertex !== undefined) {
            this.sourceVertex = FriendlyResource.fromServerFormat(
                edgeServerFormat.sourceVertex.vertex.graphElement.friendlyResource
            );
        }
        if (edgeServerFormat.destinationVertex !== undefined) {
            this.destinationVertex = FriendlyResource.fromServerFormat(
                edgeServerFormat.destinationVertex.vertex.graphElement.friendlyResource
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

    return api;
});