/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.ui.graph"
    ], function (GraphUi) {
        "use strict";
        var api = {};
        api.withoutAnIdentification = function () {
            return new Self(undefined);
        };
        api.usingIdentification = function (identification) {
            return new Self(identification);
        };
        function Self(identification) {
            this.identification = identification;
            this.vertices = {};
        }
        Self.prototype.getIdentification = function () {
            return this.identification;
        };
        Self.prototype.getVertices = function () {
            return this.vertices;
        };
        Self.prototype.getAnyVertex = function(){
            var verticesWithUri = this.getVertices();
            var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
            return verticesWithId[Object.keys(verticesWithId)[0]].vertex;
        };
        Self.prototype.addVertex = function (vertex, edge) {
            if (this.vertices[vertex.getUri()] === undefined) {
                this.vertices[vertex.getUri()] = {};
            }
            this.vertices[
                vertex.getUri()
                ][
                GraphUi.generateBubbleHtmlId()
                ] = {
                vertex: vertex,
                edge: edge
            };
        };
        Self.prototype.hasMultipleVertices = function(){
             return this.getNumberOfVertices() > 1;
        };
        Self.prototype.getNumberOfVertices = function(){
            return Object.keys(this.vertices).length;
        };
        return api;
    }
);
