/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_ui",
        "triple_brain.graph_element",
        "triple_brain.identification"
    ], function ($, GraphUi, GraphElement, Identification) {
        "use strict";
        var api = {};
        api.withoutAnIdentification = function () {
            return new GroupRelation(undefined);
        };
        api.usingIdentification = function (identification) {
            if (Array.isArray(identification)) {
                return new GroupRelation(identification);
            } else {
                return new GroupRelation([identification]);
            }
        };
        api.forTuplesAndIdentifier = function (tuples, identifier) {
            var groupRelation = new GroupRelation(
                [identifier]
            );
            tuples.forEach(function (tuple) {
                groupRelation.addTuple(
                    tuple
                );
            });
            return groupRelation;
        };
        api.usingIdentifiers = function (identifications) {
            return new GroupRelation(identifications);
        };
        function GroupRelation(identifiers) {
            this.identifiers = identifiers;
            this.vertices = {};
            this.childGroupRelations = [];
            Identification.Identification.apply(
                this
            );
            this.init(
                this.getIdentification().getServerFormat()
            );
        }

        GroupRelation.prototype = new Identification.Identification();

        GroupRelation.prototype.getIdentification = function () {
            return this.identifiers[0];
        };
        GroupRelation.prototype.getIdentifiers = function () {
            return this.identifiers;
        };

        GroupRelation.prototype.getVertices = function () {
            return this.vertices;
        };

        GroupRelation.prototype.getSortedVertices = function () {
            var self = this;
            var sortedKeys = Object.keys(this.vertices).sort(
                function (a, b) {
                    var vertexAUiInstances = self.vertices[a];
                    var vertexBUiInstances = self.vertices[b];
                    var vertexA = vertexAUiInstances[
                        Object.keys(vertexAUiInstances)
                        ].vertex;
                    var vertexB = vertexBUiInstances[
                        Object.keys(vertexBUiInstances)
                        ].vertex;
                    return GraphElement.sortCompare(
                        vertexA,
                        vertexB
                    );
                });
            var sorted = {};
            $.each(sortedKeys, function () {
                sorted[this] = self.vertices[this];
            });
            return sorted;
        };
        GroupRelation.prototype.getAnyVertex = function () {
            var verticesWithUri = this.getVertices();
            var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
            if(undefined === verticesWithId){
                return this.getChildGroupRelations()[0].getAnyVertex();
            }
            return verticesWithId[Object.keys(verticesWithId)[0]].vertex;
        };
        GroupRelation.prototype.getSingleEdge = function () {
            var verticesWithUri = this.getVertices();
            var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
            return verticesWithId[Object.keys(verticesWithId)[0]].edge;
        };
        GroupRelation.prototype.addTuple = function (tuple) {
            if (this.vertices[tuple.vertex.getUri()] === undefined) {
                this.vertices[tuple.vertex.getUri()] = {};
            }
            this.vertices[
                tuple.vertex.getUri()
                ][
                GraphUi.generateBubbleHtmlId()
                ] = {
                vertex: tuple.vertex,
                edge: tuple.edge
            };
        };
        GroupRelation.prototype.visitTuples = function (visitor) {
            $.each(this.vertices, function(vertexUri, verticesWithSameUri){
                $.each(verticesWithSameUri, function(vertexHtmlId, tuple){
                    visitor(tuple);
                });
            });
        };
        GroupRelation.prototype.removeTuple = function (tuple) {
            delete this.vertices[tuple.vertex.getUri()];
        };
        GroupRelation.prototype.isTrulyAGroupRelation = function(){
            return this.hasMultipleVertices() || this.hasGroupRelationsChild();
        };
        GroupRelation.prototype.hasMultipleVertices = function () {
            return this.getNumberOfVertices() > 1;
        };
        GroupRelation.prototype.getNumberOfVertices = function () {
            return Object.keys(this.vertices).length;
        };
        GroupRelation.prototype.getNumberOfVerticesAtAnyDepth = function () {
            var numberOfVertices = this.getNumberOfVertices();
            this.getChildGroupRelations().forEach(function(childGroupRelation){
                numberOfVertices += childGroupRelation.getNumberOfVerticesAtAnyDepth();
            });
            return numberOfVertices;
        };

        GroupRelation.prototype.hasIdentifications = function () {
            return true;
        };
        GroupRelation.prototype.hasIdentification = function (identification) {
            var contains = false;
            $.each(this.identifiers, function () {
                if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
                    contains = true;
                    return false;
                }
            });
            return contains;
        };
        GroupRelation.prototype.addIdentification = function (identifier) {
            if (this.hasIdentification(identifier)) {
                return;
            }
            this.identifiers.push(
                identifier
            );
        };
        GroupRelation.prototype.getChildGroupRelations = function () {
            return this.childGroupRelations;
        };
        GroupRelation.prototype.hasGroupRelationsChild = function () {
            return this.childGroupRelations.length > 0;
        };
        GroupRelation.prototype.addChildGroupRelation = function (groupRelation) {
            return this.childGroupRelations.push(
                groupRelation
            );
        };
        GroupRelation.prototype.integrateGroupRelationToTreeIfApplicable = function (groupRelation) {
            if (groupRelation.isARelation() && this._containsAllTuplesOfGroupRelation(groupRelation)) {
                return true;
            }
            var hasIntegrated = false;
            var doWithTuplesAtThisDepth;
            if (this._hasOneOfTheIdentifiers(groupRelation.getIdentifiers())) {
                doWithTuplesAtThisDepth = this.addTuple;
            }else if(groupRelation.isTrulyAGroupRelation() && this._doesOneOfTheChildHasIdentifiers(groupRelation.getIdentifiers())){
                doWithTuplesAtThisDepth = this.removeTuple.bind(this);
                this.addChildGroupRelation(groupRelation);
            }
            if(doWithTuplesAtThisDepth){
                groupRelation.visitTuples(function(tuple) {
                    doWithTuplesAtThisDepth(tuple);
                }.bind(this));
                hasIntegrated = true;
            }
            return hasIntegrated;
        };

        GroupRelation.prototype.isARelation = function () {
            var verticesKeys = Object.keys(this.vertices);
            if (1 !== verticesKeys.length) {
                return false;
            }
            return this.getSingleEdge().getUri() === this.getIdentification().getExternalResourceUri();
        };

        GroupRelation.prototype.getSortDate = function () {
            return new Date(0);
        };

        GroupRelation.prototype._hasOneOfTheIdentifiers = function (identifiers) {
            var has = false;
            identifiers.forEach(function (identifier) {
                if (this.hasIdentification(identifier)) {
                    has = true;
                }
            }.bind(this));
            return has;
        };

        GroupRelation.prototype._doesOneOfTheChildHasIdentifiers = function (identifiers) {
            var has = false;
            this.visitTuples(function(tuple){
                var edge = tuple.edge;
                if(edge.hasAllIdentifiers(identifiers)){
                    has = true;
                }
            });
            return has;
        };


        GroupRelation.prototype._containsAllTuplesOfGroupRelation = function (groupRelation) {
            var containsAll = true;
            var presentAtGreaterDepth = false;
            this.getChildGroupRelations().forEach(function(childGroupRelation){
                if(childGroupRelation._containsAllTuplesOfGroupRelation(groupRelation)){
                    presentAtGreaterDepth = true;
                }
            });
            if(!presentAtGreaterDepth){
                $.each(groupRelation.getVertices(), function (vertexKey) {
                    if (this.vertices[vertexKey] === undefined) {
                        containsAll = false;
                        return false;
                    }
                }.bind(this));
            }
            return containsAll;
        };

        return api;
    }
);
