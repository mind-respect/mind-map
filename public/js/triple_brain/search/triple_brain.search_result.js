/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.schema",
    "triple_brain.property",
    "triple_brain.vertex",
    "triple_brain.graph_element_type",
    "triple_brain.event_bus",
    "triple_brain.wikidata_uri",
    "jquery.i18next"
], function ($, GraphElement, Edge, Schema, Property, Vertex, GraphElementType, EventBus, WikiDataUri) {
    "use strict";
    var api = {},
        referencesText;
    api.additionalTypes = {
        "Edge" : "edge",
        "Identification" : "identification"
    };
    api.fromServerFormatArray = function (searchResultsServerFormat) {
        var searchResults = [];
        $.each(searchResultsServerFormat, function(){
            searchResults.push(
                api.fromServerFormat(
                    this
                )
            );
        });
        return searchResults;
    };
    api.fromServerFormat = function (searchResult) {
        switch (searchResult.type) {
            case api.additionalTypes.Edge :
                var sourceVertex = Vertex.fromServerFormat(
                        searchResult.edge.sourceVertex
                    ),
                    destinationVertex = Vertex.fromServerFormat(
                        searchResult.edge.destinationVertex
                    );
                return new Self(
                    Edge.fromServerFormat(searchResult.edge),
                    GraphElementType.Relation,
                    api._buildEdgeSomethingToDistinguish(
                        sourceVertex,
                        destinationVertex
                    )
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
            case api.additionalTypes.Identification :
                var graphElement = GraphElement.fromServerFormat(searchResult.graphElement);
                return new Self(
                    graphElement,
                    api.additionalTypes.Identification,
                    api._buildIdentifierSomethingToDistinguish(searchResult)
                );
        }
    };
    api._buildPropertySomethingToDistinguish = function (property) {
        return property.getSchema().getLabel();
    };
    api._buildEdgeSomethingToDistinguish = function (sourceVertex, destinationVertex) {
        return sourceVertex.getLabel() + " -> " +destinationVertex.getLabel();
    };
    api._buildSchemaSomethingToDistinguish = function (schema) {
        return api.formatRelationsName(
            api.removedEmptyAndDuplicateRelationsName(
                schema.getPropertiesName()
            )
        );
    };
    api._buildVertexSomethingToDistinguish = function (searchResult) {
        var edgesName = [],
            number = 0;
        if(!searchResult.properties){
            return "";
        }
        $.each(searchResult.properties, function () {
            var property = GraphElement.fromServerFormat(this);
            edgesName.push(property.getLabel());
            number++;
            if(number === 5){
                return false;
            }
        });

        return api.formatRelationsName(
                api.removedEmptyAndDuplicateRelationsName(
                    edgesName
                )
            );
    };
    api._buildIdentifierSomethingToDistinguish = function(searchResult){
        var source = WikiDataUri.isAWikidataUri(
            searchResult.externalUri
        ) ? "wikipedia.org" : "bubl.guru";
        return searchResult.nbReferences + referencesText + ". source: " + source;
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
                    relationsName.indexOf(relationName) === position;
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
    EventBus.subscribe("localized-text-loaded", function(){
        referencesText = $.t("search.identifier.references");
    });
    return api;
});