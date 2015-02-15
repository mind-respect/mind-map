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
    api.fromServerFormat = function (searchResult) {
        switch (searchResult.type) {
            case "edge" :
                return api.forGraphElementAndItsType(
                    Edge.fromServerFormat(searchResult.edge),
                    GraphElementType.Relation,
                    ""
                );
            case GraphElementType.Schema :
                var schema = Schema.fromSearchResult(searchResult);
                return new Self(
                    schema,
                    GraphElementType.Schema,
                    api._buildSchemaSomethingToDistinguish(schema)
                );
            case GraphElementType.Property :
                var property = Property.fromServerFormat(searchResult.graphElement);
                property.setSchema(
                    Schema.fromServerFormat(searchResult.schema)
                );
                return new Self(
                    property,
                    GraphElementType.Property,
                    api._buildPropertySomethingToDistinguish(property)
                );
            case GraphElementType.Vertex :
                var vertex = GraphElement.fromServerFormat(searchResult.graphElement);
                return new Self(
                    vertex,
                    GraphElementType.Vertex,
                    api._buildVertexSomethingToDistinguish(searchResult)
                );
        }
    };
    api._buildPropertySomethingToDistinguish = function (property) {
        return $.t("search.context.property") + " " + property.getSchema().getLabel();
    };
    api._buildSchemaSomethingToDistinguish = function (schema) {
        return api.formatRelationsName(
            api.removedEmptyAndDuplicateRelationsName(
                schema.getPropertiesName()
            )
        );
    };
    api._buildVertexSomethingToDistinguish = function (searchResult) {
        var edgesName = [];
        $.each(searchResult.properties, function(){
            var property = GraphElement.fromServerFormat(this);
            edgesName.push(property.getLabel());
        });
        return  $.t("search.context.vertex") + " " +
            api.formatRelationsName(
                api.removedEmptyAndDuplicateRelationsName(
                    edgesName
                )
            );
    };
    api.forGraphElementAndItsType = function (graphElement, graphElementType) {
        return new Self(
            graphElement,
            graphElementType
        );
    };
    api.formatRelationsName = function (relationsName) {
        return relationsName.join(", ");
    };
    api.removedEmptyAndDuplicateRelationsName = function (relationsName) {
        return relationsName.filter(
            function (relationName, position) {
                return relationName !== "" &&
                    relationsName.indexOf(relationName) == position;
            }
        );
    };

    function Self(graphElement, graphElementType, somethingToDistinguish) {
        this.graphElement = graphElement;
        this.graphElementType = graphElementType;
        this.somethingToDistinguish = somethingToDistinguish;
    }

    Self.prototype.getGraphElement = function () {
        return this.graphElement;
    };
    Self.prototype.getGraphElementType = function () {
        return this.graphElementType;
    };

    Self.prototype.is = function (graphElementType) {
        return graphElementType === this.getGraphElementType();
    };
    Self.prototype.getSomethingToDistinguish = function () {
        return this.somethingToDistinguish;
    };
    return api;
});