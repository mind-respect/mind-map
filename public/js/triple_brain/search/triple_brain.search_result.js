/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.schema",
    "triple_brain.property",
    "triple_brain.vertex",
    "triple_brain.identification",
    "triple_brain.graph_element_type",
    "triple_brain.event_bus",
    "triple_brain.wikidata_uri",
    "jquery.i18next"
], function ($, IdUri, GraphElement, Edge, Schema, Property, Vertex, Identification, GraphElementType, EventBus, WikiDataUri) {
    "use strict";
    var api = {},
        referencesText;
    api.additionalTypes = {
        "Edge" : "edge"
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
                // var sourceVertex = Vertex.fromServerFormat(
                //         searchResult.edge.sourceVertex
                //     ),
                //     destinationVertex = Vertex.fromServerFormat(
                //         searchResult.edge.destinationVertex
                //     );
                return new SearchResult(
                    GraphElement.fromServerFormat(searchResult.graphElement),
                    GraphElementType.Relation,
                    api._buildSomethingToDistinguish(
                        searchResult
                    ),
                    searchResult
                );
            case GraphElementType.Schema :
                var schema = Schema.fromSearchResult(searchResult);
                return new SearchResult(
                    schema,
                    GraphElementType.Schema,
                    api._buildSomethingToDistinguish(searchResult),
                    searchResult
                );
            case GraphElementType.Property :
                var property = Property.fromServerFormat(searchResult.graphElement);
                return new SearchResult(
                    property,
                    GraphElementType.Property,
                    api._buildPropertySomethingToDistinguish(searchResult),
                    searchResult
                );
            case GraphElementType.Vertex :
                var vertex = GraphElement.fromServerFormat(searchResult.graphElement);
                return new SearchResult(
                    vertex,
                    GraphElementType.Vertex,
                    api._buildSomethingToDistinguish(searchResult),
                    searchResult
                );
            case GraphElementType.Meta :
                var identifierAsGraphElement = GraphElement.fromServerFormat(
                    searchResult.graphElement
                );
                var identifier = identifierAsGraphElement.getIdentifiers()[0];
                return new SearchResult(
                    identifier,
                    GraphElementType.Meta,
                    api._buildIdentifierSomethingToDistinguish(identifier),
                    searchResult
                );
        }
    };
    api._buildPropertySomethingToDistinguish = function (searchResult) {
        if(!searchResult.context){
            return "";
        }
        return "<- " + searchResult.context[Object.keys(searchResult.context)];
    };
    api._buildSomethingToDistinguish = function(searchResult){
        if(!searchResult.context){
            return "";
        }
        var contextLabels = [];
        Object.keys(searchResult.context).forEach(function(uri) {
            contextLabels.push(searchResult.context[uri]);
        });
        return contextLabels.join(", ");
    };
    api._buildEdgeSomethingToDistinguish = function (searchResult) {
        var contextValues = Object.values(searchResult.context);
        return contextValues[0] + "  " + contextValues[1];
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
    api._buildIdentifierSomethingToDistinguish = function(identifier){
        var source = WikiDataUri.isAWikidataUri(
            identifier.getExternalResourceUri()
        ) ? "wikipedia.org" : "mindrespect.com";
        return identifier.getNbReferences() + referencesText + ". source: " + source;
    };
    api.forGraphElementAndItsType = function (graphElement, graphElementType) {
        return new SearchResult(
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

    function SearchResult(graphElement, graphElementType, somethingToDistinguish, serverFormat) {
        this.graphElement = graphElement;
        this.graphElementType = graphElementType;
        this.somethingToDistinguish = somethingToDistinguish;
        this.serverFormat = serverFormat;
    }

    SearchResult.prototype.getGraphElement = function () {
        return this.graphElement;
    };
    
    SearchResult.prototype.getGraphElementType = function () {
        return this.graphElementType;
    };

    SearchResult.prototype.getDeepGraphElementType = function () {
        return this.getGraphElementType();
    };

    SearchResult.prototype.getNumberOfReferences = function () {
        return GraphElementType.Meta === this.getGraphElementType() ?
            this.graphElement.getNbReferences() : 0;
    };

    SearchResult.prototype.getNbVisits = function () {
        return this.serverFormat.nbVisits;
    };

    SearchResult.prototype.is = function (graphElementType) {
        return graphElementType === this.getGraphElementType();
    };
    SearchResult.prototype.getSomethingToDistinguish = function () {
        return this.somethingToDistinguish;
    };
    EventBus.subscribe("localized-text-loaded", function(){
        referencesText = $.t("search.identifier.bubbles");
    });
    return api;
});