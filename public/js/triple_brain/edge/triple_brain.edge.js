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
        return new api.Edge().init(serverFormat);
    };
    api.withLabelSelfSourceAndDestinationUri = function (label, uri, sourceUri, destinationUri) {
        var edge = new api.Edge().init(
            api.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                uri,
                sourceUri,
                destinationUri
            )
        );
        edge.setLabel(label);
        return edge;
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
    api.buildServerFormatFromUi = function (edgeUi) {
        return {
            graphElement: GraphElement.buildServerFormatFromUi(
                edgeUi
            ),
            sourceVertex: VertexServerFormatBuilder.buildWithUri(
                edgeUi.getSourceVertex().getUri()
            ),
            destinationVertex: VertexServerFormatBuilder.buildWithUri(
                edgeUi.getDestinationVertex().getUri()
            )
        };
    };
    api.Edge = function () {
    };

    api.Edge.prototype = new GraphElement.GraphElement();

    api.Edge.prototype.init = function (edgeServerFormat) {
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
        GraphElement.GraphElement.apply(
            this
        );
        GraphElement.GraphElement.prototype.init.call(
            this,
            edgeServerFormat.graphElement
        );
        this.edgeServerFormat = edgeServerFormat;
        return this;
    };

    api.Edge.prototype.setSourceVertex = function (sourceVertex) {
        return this.sourceVertex = sourceVertex;
    };
    api.Edge.prototype.setDestinationVertex = function (destinationVertex) {
        return this.destinationVertex = destinationVertex;
    };

    api.Edge.prototype.getSourceVertex = function () {
        return this.sourceVertex;
    };
    api.Edge.prototype.getDestinationVertex = function () {
        return this.destinationVertex;
    };
    api.Edge.prototype.isPublic = function () {
        return this.getSourceVertex().isPublic() &&
            this.getDestinationVertex().isPublic();
    };
    api.Edge.prototype.isPrivate = function () {
        return this.getSourceVertex().isPrivate() ||
            this.getDestinationVertex().isPrivate();
    };

    api.Edge.prototype.isFriendsOnly = function () {
        return this.getSourceVertex().isFriendsOnly() &&
            this.getDestinationVertex().isFriendsOnly();
    };

    api.Edge.prototype.isSourceVertex = function (vertex) {
        return this.getSourceVertex().getUri() === vertex.getUri();
    };
    api.Edge.prototype.isDestinationVertex = function (vertex) {
        return this.getDestinationVertex().getUri() === vertex.getUri();
    };
    api.Edge.prototype.isRelatedToVertex = function (vertex) {
        return this.isSourceVertex(vertex) ||
            this.isDestinationVertex(vertex);
    };
    api.Edge.prototype.getOtherVertex = function (vertex) {
        return this.getSourceVertex().getUri() === vertex.getUri() ?
            this.getDestinationVertex() : this.getSourceVertex();
    };
    api.Edge.prototype.isToTheLeft = function (centerVertex) {
        var childVertex = this.getOtherVertex(centerVertex);
        var childVertexIndex = centerVertex.getChildrenIndex()[childVertex.getUri()];
        if (childVertexIndex === undefined) {
            return undefined;
        }
        return childVertexIndex.toTheLeft;
    };
    return api;
});
