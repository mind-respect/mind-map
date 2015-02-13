/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.schema",
    "triple_brain.property",
    "triple_brain.graph_element_type"
], function (GraphElement, Edge, Schema, Property, GraphElementType) {
    "use strict";
    var api = {};
    function Self(graphElement, graphElementType) {
        this.graphElement = graphElement;
        this.graphElementType = graphElementType;
    }
    api.fromServerFormat = function (searchResult) {
        switch(searchResult.type){
            case "edge" :
                return api.forGraphElementAndItsType(
                    Edge.fromServerFormat(searchResult.edge),
                    GraphElementType.Relation
                );
            case GraphElementType.Schema :
                return api.forGraphElementAndItsType(
                    Schema.fromSearchResult(searchResult),
                    GraphElementType.Schema
                );
            case GraphElementType.Property :
                var property = Property.fromServerFormat(searchResult.graphElement);
                property.setSchema(
                    Schema.fromServerFormat(searchResult.schema)
                );
                return api.forGraphElementAndItsType(
                    property,
                    GraphElementType.Property
                );
        }
        return api.forGraphElementAndItsType(
            GraphElement.fromServerFormat(searchResult.graphElement),
            searchResult.type
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

    Self.prototype.is = function(graphElementType){
        return graphElementType === this.getGraphElementType();
    };
    return api;
});