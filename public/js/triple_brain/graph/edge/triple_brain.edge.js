/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element",
    "triple_brain.friendly_resource",
    "triple_brain.vertex_server_format_builder"
], function (GraphElement, FriendlyResource, VertexServerFormatBuilder) {
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
            sourceVertex: VertexServerFormatBuilder.buildWithUri(
                sourceVertexUri
            ),
            destinationVertex: VertexServerFormatBuilder.buildWithUri(
                destinationVertexUri
            )
        };
    };
    api.Self = function () {
    };

    api.Self.prototype = new GraphElement.Self;

    api.Self.prototype.init = function (edgeServerFormat) {
        this.sourceVertex = FriendlyResource.fromServerFormat(
            VertexServerFormatBuilder.getFriendlyResourceServerObject(
                edgeServerFormat.sourceVertex
            )
        );
        this.destinationVertex = FriendlyResource.fromServerFormat(
            VertexServerFormatBuilder.getFriendlyResourceServerObject(
                edgeServerFormat.destinationVertex
            )
        );
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