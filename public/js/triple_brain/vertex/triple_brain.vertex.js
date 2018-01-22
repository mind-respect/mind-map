/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.suggestion"
], function ($, GraphElement, Edge, Suggestion) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Vertex(
            serverFormat
        );
    };
    api.withUri = function (uri) {
        return new Vertex(
            api.buildServerFormatFromUri(
                uri
            )
        );
    };
    api.buildServerFormatFromUri = function(uri){
        return {
            vertex:{
                graphElement: GraphElement.buildObjectWithUri(uri),
                includedEdges:{},
                includedVertices:{},
                isPublic:false,
                suggestions:{}
            }
        };
    };
    api.buildServerFormatFromUi = function (vertexUi) {
        return {
            vertex:{
                graphElement: GraphElement.buildServerFormatFromUi(
                    vertexUi
                ),
                includedEdges:{},
                includedVertices:{},
                isPublic:vertexUi.getModel().isPublic(),
                numberOfConnectedEdges: vertexUi.connectedEdges().length,
                suggestions:{}
            }
        };
    };
    function Vertex(vertexServerFormat) {
        this.vertexServerFormat = vertexServerFormat;
        this.vertexServerFormat.vertex.numberOfConnectedEdges = this.vertexServerFormat.vertex.numberOfConnectedEdges || 0;
        this._includedVertices = this._buildIncludedVertices();
        this._includedEdges = this._buildIncludedEdges();
        this._suggestions = this._buildSuggestions();
        GraphElement.GraphElement.apply(
            this
        );
        this.init(vertexServerFormat.vertex.graphElement);
    }

    Vertex.prototype = new GraphElement.GraphElement();

    Vertex.prototype.getColors

    Vertex.prototype.hasIncludedGraphElements = function () {
        return Object.keys(this.getIncludedVertices()).length > 0;
    };

    Vertex.prototype.getIncludedVertices = function () {
        return this._includedVertices;
    };
    Vertex.prototype.getIncludedEdges = function () {
        return this._includedEdges;
    };
    Vertex.prototype.setSuggestions = function (suggestions) {
        return this._suggestions = suggestions;
    };
    Vertex.prototype.getSuggestions = function () {
        return this._suggestions;
    };
    Vertex.prototype.getNumberOfConnectedEdges = function () {
        return this.vertexServerFormat.vertex.numberOfConnectedEdges;
    };

    Vertex.prototype.getNumberOfChild = function () {
        return this.getNumberOfConnectedEdges() - 1;
    };

    Vertex.prototype.incrementNumberOfConnectedEdges = function () {
        this.vertexServerFormat.vertex.numberOfConnectedEdges++;
    };

    Vertex.prototype.decrementNumberOfConnectedEdges = function () {
        this.vertexServerFormat.vertex.numberOfConnectedEdges--;
    };

    Vertex.prototype.getNbPublicNeighbors = function () {
        return this.vertexServerFormat.vertex.nbPublicNeighbors;
    };

    Vertex.prototype.hasOnlyOneHiddenChild = function () {
        return 2 === this.getNumberOfConnectedEdges();
    };

    Vertex.prototype.isPublic = function () {
        return this.vertexServerFormat.vertex.isPublic;
    };

    Vertex.prototype.makePrivate = function () {
        return this.vertexServerFormat.vertex.isPublic = false;
    };

    Vertex.prototype.makePublic = function () {
        return this.vertexServerFormat.vertex.isPublic = true;
    };

    Vertex.prototype._buildIncludedEdges = function () {
        var includedEdges = {};
        if (this.vertexServerFormat.vertex.includedEdges === undefined) {
            return includedEdges;
        }
        $.each(this.vertexServerFormat.vertex.includedEdges, function (key, value) {
            includedEdges[key] = Edge.fromServerFormat(
                value
            );
        });
        return includedEdges;
    };

    Vertex.prototype._buildIncludedVertices = function () {
        var includedVertices = {};
        if (this.vertexServerFormat.vertex.includedVertices === undefined) {
            return includedVertices;
        }
        $.each(this.vertexServerFormat.vertex.includedVertices, function (key, value) {
            includedVertices[key] = api.fromServerFormat(
                value
            );
        });
        return includedVertices;
    };

    Vertex.prototype._buildSuggestions = function () {
        var suggestions = [];
        if (this.vertexServerFormat.vertex.suggestions === undefined) {
            return suggestions;
        }
        return Suggestion.fromServerArray(
            this.vertexServerFormat.vertex.suggestions
        );
    };
    Vertex.prototype.addSuggestions = function(suggestions){
        this._suggestions = this._suggestions.concat(
            suggestions
        );
    };

    return api;
});