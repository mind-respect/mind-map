/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.graph_element_server_facade",
    "triple_brain.edge_server_facade",
    "triple_brain.suggestion"
], function (require, GraphElementServerFacade, EdgeServerFacade, Suggestion) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Self(
            serverFormat
        );
    };
    api.buildObjectWithUri = function (uri) {
        return {
            vertex: {
                graphElement: GraphElementServerFacade.buildObjectWithUri(uri)
            }
        };
    };
    function Self(vertexServerFormat) {
        this.vertexServerFormat = vertexServerFormat;
        this._includedVertices = this._buildIncludedVertices();
        this._includedEdges = this._buildIncludedEdges();
        this._suggestions = this._buildSuggestions();
        GraphElementServerFacade.Self.apply(
            this
        );
        this.init(vertexServerFormat.vertex.graphElement);
    }

    Self.prototype = new GraphElementServerFacade.Self;

    Self.prototype.getIncludedVertices = function () {
        return this._includedVertices;
    };
    Self.prototype.getIncludedEdges = function () {
        return this._includedEdges;
    };
    Self.prototype.getSuggestions = function () {
        return this._suggestions;
    };
    Self.prototype.getNumberOfConnectedEdges = function () {
        return this.vertexServerFormat.vertex.numberOfConnectedEdges;
    };
    Self.prototype.isPublic = function () {
        return this.vertexServerFormat.vertex.isPublic;
    };

    Self.prototype._buildIncludedEdges = function () {
        var includedEdges = {};
        if (this.vertexServerFormat.vertex.includedEdges === undefined) {
            return includedEdges;
        }
        $.each(this.vertexServerFormat.vertex.includedEdges, function (key, value) {
            includedEdges[key] = getEdgeServerFacade().fromServerFormat(
                value
            );
        });
        return includedEdges;
    };

    Self.prototype._buildIncludedVertices = function () {
        var includedVertices = {};
        if (this.vertexServerFormat.vertex.includedVertices === undefined) {
            return includedVertices;
        }
        $.each(this.vertexServerFormat.vertex.includedVertices, function (key, value) {
            includedVertices[key] = api.fromvertexServerFormat(
                value
            );
        });
        return includedVertices;
    };

    Self.prototype._buildSuggestions = function () {
        var suggestions = [];
        if (this.vertexServerFormat.vertex.suggestions === undefined) {
            return suggestions;
        }
        return Suggestion.fromJsonArrayOfServer(
            this.vertexServerFormat.vertex.suggestions
        );
    };
    return api;

    function getEdgeServerFacade() {
        if (undefined === EdgeServerFacade) {
            EdgeServerFacade = require("triple_brain.edge_server_facade");
        }
        return EdgeServerFacade;
    }
});