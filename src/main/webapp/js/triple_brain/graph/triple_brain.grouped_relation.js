/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.ui.graph"
    ], function (GraphUi) {
        var api = {};
        api.withoutAnIdentification = function(){
            return new Object(undefined);
        };
        api.usingIdentification = function (identification) {
            return new Object(identification);
        };
        return api;
        function Object(identification) {
            var vertices = {};
            this.getIdentification = function () {
                return identification;
            };
            this.getVertices = function () {
                return vertices;
            };
            this.addVertex = function (vertex, edge) {
                if (vertices[vertex.getUri()] === undefined) {
                    vertices[vertex.getUri()] = {};
                }
                vertices[
                    vertex.getUri()
                    ][
                    GraphUi.generateVertexHtmlId()
                    ] = {
                    vertex: vertex,
                    edge: edge
                };
            };
        }
    }
);
