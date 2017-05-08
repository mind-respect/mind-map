/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.edge_ui",
    "triple_brain.vertex_ui",
    "triple_brain.edge",
    "triple_brain.vertex"
], function ($, EdgeUi, VertexUi, Edge, Vertex) {
    "use strict";
    var api = {};
    api.buildServerFormat = function () {
        var edges = {},
            vertices = {};
        EdgeUi.visitAllEdges(function (edgeUi) {
            edges[edgeUi.getUri()] = Edge.buildServerFormatFromUi(
                edgeUi
            );
        });
        VertexUi.visitAllVertices(function (vertexUi) {
            vertices[vertexUi.getUri()] = Vertex.buildServerFormatFromUi(
                vertexUi
            );
        });
        return {
            edges: edges,
            vertices: vertices
        };
    };
    api.fromServerFormat = function (serverFormat) {
        return new api.SubGraph(
            serverFormat
        );
    };
    api.SubGraph = function(serverFormat) {
        this.serverFormat = serverFormat;
        this._buildEdges();
        this._buildVertices();
    };

    api.SubGraph.prototype.getEdgeRelatedToIdentification = function (identification) {
        return this._relatedToIdentificationForGraphElements(
            identification,
            this.edges
        );
    };

    api.SubGraph.prototype.getVertexRelatedToIdentification = function (identification) {
        return this._relatedToIdentificationForGraphElements(
            identification,
            this.vertices
        );
    };

    api.SubGraph.prototype.visitEdgesRelatedToVertex = function (vertex, visitor) {
        $.each(this.edges, function () {
            if (this.isRelatedToVertex(vertex)) {
                visitor(this);
            }
        });
    };

    api.SubGraph.prototype.getAnyUri = function () {
        return Object.keys(
            this.vertices
        )[0];
    };

    api.SubGraph.prototype._buildEdges = function () {
        this.edges = {};
        var self = this;
        $.each(this.serverFormat.edges, function () {
            var facade = Edge.fromServerFormat(this);
            self.edges[facade.getUri()] = facade;
        });
    };

    api.SubGraph.prototype.visitEdges = function (visitor) {
        Object.keys(this.edges).forEach(function(key){
            visitor(this.edges[key]);
        }.bind(this));
    };

    api.SubGraph.prototype.visitVertices = function (visitor) {
        Object.keys(this.vertices).forEach(function(key){
            visitor(this.vertices[key]);
        }.bind(this));
    };

    api.SubGraph.prototype.visitGraphElements = function(visitor){
        this.visitEdges(visitor);
        this.visitVertices(visitor);
    };

    api.SubGraph.prototype.getVertexWithUri = function (uri) {
        return this.vertices[uri];
    };

    api.SubGraph.prototype._buildVertices = function () {
        this.vertices = {};
        var self = this;
        $.each(this.serverFormat.vertices, function () {
            var facade = Vertex.fromServerFormat(this);
            self.vertices[facade.getUri()] = facade;
        });
    };
    api.SubGraph.prototype._relatedToIdentificationForGraphElements = function (identification, graphElements) {
        var related = false;
        $.each(graphElements, function () {
            var graphElement = this;
            if (graphElement.isRelatedToIdentifier(identification)) {
                related = graphElement;
                return false;
            }
        });
        return related;
    };
    return api;
});