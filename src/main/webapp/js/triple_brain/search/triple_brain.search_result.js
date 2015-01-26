/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.schema",
    "triple_brain.graph_element_type"
], function (GraphElement, Edge, Schema, GraphElementType) {
    "use strict";
    var api = {};
    function Self(graphElement, graphElementType) {
        this.graphElement = graphElement;
        this.graphElementType = graphElementType;
    }
    api.fromServerFormat = function (searchResult) {
        var isRelation = searchResult.edge !== undefined;
        if(isRelation){
            return api.forGraphElementAndItsType(
                Edge.fromServerFormat(searchResult.edge),
                GraphElementType.Relation
            );
        }
        var isSchema = searchResult.properties !== undefined;
        if(isSchema){
            return api.forGraphElementAndItsType(
                Schema.fromSearchResult(searchResult),
                GraphElementType.Schema
            );
        }
        return api.forGraphElementAndItsType(
            GraphElement.fromServerFormat(searchResult.graphElement),
            GraphElementType.Vertex
        );
    };
    api.forGraphElementAndItsType = function (graphElement, graphElementType) {
        return new Self(
            graphElement,
            graphElementType
        );
    };
    Self.prototype.getGraphElement = function () {
        return this.graphElement;
    };
    Self.prototype.getGraphElementType = function () {
        return this.graphElementType;
    };
    Self.prototype.setGraphElementType = function (graphElementType) {
        this.graphElementType = graphElementType;
    };
    Self.prototype.is = function(graphElementType){
        return graphElementType === this.getGraphElementType();
    };
    return api;
});