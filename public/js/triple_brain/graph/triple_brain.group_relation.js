/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.ui.graph"
    ], function (GraphUi) {
        "use strict";
        var api = {};
        api.withoutAnIdentification = function () {
            return new GroupRelation(undefined);
        };
        api.usingIdentification = function (identification) {
            if(Array.isArray(identification)){
                return new GroupRelation(identification);
            }else{
                return new GroupRelation([identification]);
            }
        };
        api.usingIdentifiers = function(identifications){
            return new GroupRelation(identifications);
        };
        function GroupRelation(identifiers) {
            this.identifiers = identifiers;
            this.vertices = {};
        }
        GroupRelation.prototype.getIdentification = function () {
            return this.identifiers[0];
        };
        GroupRelation.prototype.getIdentifiers = function(){
            return this.identifiers;
        };
        GroupRelation.prototype.getVertices = function () {
            return this.vertices;
        };
        GroupRelation.prototype.getAnyVertex = function(){
            var verticesWithUri = this.getVertices();
            var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
            return verticesWithId[Object.keys(verticesWithId)[0]].vertex;
        };
        GroupRelation.prototype.addVertex = function (vertex, edge) {
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
        GroupRelation.prototype.hasMultipleVertices = function(){
             return this.getNumberOfVertices() > 1;
        };
        GroupRelation.prototype.getNumberOfVertices = function(){
            return Object.keys(this.vertices).length;
        };
        return api;
    }
);
