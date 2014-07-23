/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.ui.graph"
    ], function (GraphUi) {
        var api = {};
        api.withoutAnIdentification = function () {
            return new Object(undefined);
        };
        api.usingIdentification = function (identification) {
            return new Object(identification);
        };
        Object.prototype.getIdentification = function () {
            return this.identification;
        };
        Object.prototype.getVertices = function () {
            return this.vertices;
        };
        Object.prototype.addVertex = function (vertex, edge) {
            if (this.vertices[vertex.getUri()] === undefined) {
                this.vertices[vertex.getUri()] = {};
            }
            this.vertices[
                vertex.getUri()
                ][
                GraphUi.generateVertexHtmlId()
                ] = {
                vertex: vertex,
                edge: edge
            };
        };
        return api;
        function Object(identification) {
            this.identification = identification;
            this.vertices = {};
        }
    }
);
