/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_service",
    "triple_brain.edge_service",
    "triple_brain.selection_handler",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_controller",
    "triple_brain.delete_menu",
    "triple_brain.edge_ui",
    "triple_brain.image_menu",
    "triple_brain.included_graph_elements_menu",
    "triple_brain.vertex_ui",
    "triple_brain.vertex",
    "triple_brain.identification",
    "triple_brain.graph_element_service",
    "triple_brain.schema_suggestion",
    "triple_brain.event_bus",
    "triple_brain.id_uri"
], function ($, VertexService, EdgeService, SelectionHandler, GraphDisplayer, GraphElementController, DeleteMenu, EdgeUi, ImageMenu, IncludedGraphElementsMenu, VertexUi, Vertex, Identification, GraphElementService, SchemaSuggestion, EventBus, IdUri) {
    "use strict";
    var api = {};

    function VertexController(vertices) {
        this.vertices = vertices;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.vertices
        );
    }

    VertexController.prototype = new GraphElementController.GraphElementController();

    VertexController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    VertexController.prototype.addChild = function () {
        return api.addChildToRealAndUiParent(
            this.getUi()
        );
    };

    VertexController.prototype.addSiblingCanDo = function () {
        return this.isSingleAndOwned() && !this.vertices.isCenterBubble();
    };

    VertexController.prototype.addSibling = function () {
        if (this.getUi().isImmediateChildOfGroupRelation()) {
            var groupRelation = this.getUi().getParentBubble().getParentBubble();
            return groupRelation.getController().addChild();
        }
        api.addChildToRealAndUiParent(
            this.getUi().getParentVertex(),
            this.getUi().getParentBubble().getParentBubble()
        ).then(function (triple) {
            triple.edge().getController().moveUnder(
                this.getUi().getParentBubble()
            );
            SelectionHandler.setToSingleVertex(
                triple.destinationVertex()
            );
            triple.destinationVertex().centerOnScreenWithAnimation();
        }.bind(this));
    };

    VertexController.prototype.removeCanDo = function () {
        return this.isOwned();
    };

    VertexController.prototype.remove = function (skipConfirmation) {
        if (skipConfirmation) {
            return deleteAfterConfirmationBehavior.bind(this)(
                this.vertices
            );
        }
        return DeleteMenu.ofVertexAndDeletionBehavior(
            this.vertices,
            deleteAfterConfirmationBehavior.bind(this)
        ).build();
        function deleteAfterConfirmationBehavior(vertexUi) {
            var removePromise = this.isSingle() ?
                VertexService.remove(
                    vertexUi
                ) :
                VertexService.removeCollection(
                    vertexUi
                );
            return removePromise.then(function () {
                if (this.isSingle()) {
                    vertexUi.remove();
                    return true;
                }
                vertexUi.forEach(function (vertexUi) {
                    vertexUi.remove();
                });
                return true;
            }.bind(this));
        }
    };

    VertexController.prototype.imagesCanDo = function () {
        return this.isSingleAndOwned();
    };

    VertexController.prototype.images = function () {
        ImageMenu.ofVertex(
            this.vertices
        ).build();
    };

    VertexController.prototype.makePrivateCanDo = function () {
        return this.isOwned() && (
                (this.isMultiple() && !this._areAllElementsPrivate()) || (
                    this.isSingle() && this.getUi().getModel().isPublic()
                )
            );
    };

    VertexController.prototype.makePrivate = function () {
        var self = this;
        if (this.isSingle()) {
            VertexService.makePrivate(
                this.getUi()
            ).then(function () {
                self.getModel().makePrivate();
                self.getUi().makePrivate();
                publishVertexPrivacyUpdated(
                    self.getUi()
                );
            });
        } else {
            var publicVertices = [];
            $.each(self.getUi(), function () {
                var vertex = this;
                if (this.getModel().isPublic()) {
                    publicVertices.push(
                        vertex
                    );
                }
            });
            VertexService.makeCollectionPrivate(
                publicVertices
            ).then(function () {
                $.each(publicVertices, function () {
                    var ui = this;
                    ui.getModel().makePrivate();
                    ui.makePrivate();
                    publishVertexPrivacyUpdated(ui);
                });
            });
        }
    };

    VertexController.prototype.makePublicCanDo = function () {
        return this.isOwned() && (
                (this.isMultiple() && !this._areAllElementsPublic()) || (
                    this.isSingle() && !this.getUi().getModel().isPublic()
                )
            );
    };

    VertexController.prototype._areAllElementsPublic = function () {
        var allPublic = true;
        $.each(this.getUi(), function () {
            if (!this.getModel().isPublic()) {
                allPublic = false;
                return false;
            }
        });
        return allPublic;
    };

    VertexController.prototype._areAllElementsPrivate = function () {
        var allPrivate = true;
        $.each(this.getUi(), function () {
            if (this.getModel().isPublic()) {
                allPrivate = false;
                return false;
            }
        });
        return allPrivate;
    };

    VertexController.prototype.makePublic = function () {
        var self = this;
        if (this.isSingle()) {
            VertexService.makePublic(
                this.getUi()
            ).then(function () {
                self.getModel().makePublic();
                self.getUi().makePublic();
                publishVertexPrivacyUpdated(
                    self.getUi()
                );
            });
        } else {
            var privateVertices = [];
            $.each(self.getUi(), function () {
                var vertex = this;
                if (!this.getModel().isPublic()) {
                    privateVertices.push(
                        vertex
                    );
                }
            });
            VertexService.makeCollectionPublic(
                privateVertices
            ).then(function () {
                $.each(privateVertices, function () {
                    var ui = this;
                    ui.getModel().makePublic();
                    ui.makePublic();
                    publishVertexPrivacyUpdated(ui);
                });
            });
        }
    };

    function publishVertexPrivacyUpdated(ui) {
        EventBus.publish(
            '/event/ui/graph/vertex/privacy/updated',
            ui
        );
    }

    VertexController.prototype.subElementsCanDo = function () {
        return this.isSingle() && this.vertices.hasIncludedGraphElements();
    };

    VertexController.prototype.subElements = function () {
        IncludedGraphElementsMenu.ofVertex(
            this.vertices
        ).create();
    };

    VertexController.prototype.suggestionsCanDo = function () {
        return this.isSingleAndOwned() && this.vertices.hasSuggestions();
    };

    VertexController.prototype.suggestions = function () {
        var suggestionMethod = this.vertices.areSuggestionsShown() ?
            "hide" : "show";
        this.vertices.visitAllChild(function (child) {
            if (child.isSuggestion()) {
                child[suggestionMethod]();
            }
        });
    };

    VertexController.prototype.createVertexFromSchema = function (schema) {
        var newVertex;
        var deferred = $.Deferred();
        VertexService.createVertex().then(
            addIdentification
        ).then(
            addSuggestions
        ).then(function () {
            deferred.resolve(
                newVertex
            );
        });
        return deferred;
        function addIdentification(newVertexServerFormat) {
            newVertex = Vertex.fromServerFormat(
                newVertexServerFormat
            );
            var identification = Identification.fromFriendlyResource(
                schema
            );
            identification.setType("generic");
            return GraphElementService.addIdentification(
                newVertex,
                identification
            );
        }

        function addSuggestions() {
            return SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                newVertex,
                schema.getUri()
            );
        }
    };

    VertexController.prototype.copyCanDo = function () {
        return !this.isSingle() || "" !== this.getUi().text();
    };

    VertexController.prototype.copy = function () {
    };

    VertexController.prototype.groupCanDo = function () {
        return this.isGroupAndOwned();
    };
    VertexController.prototype.group = function () {
        var selectedGraphElements = {
            edges: {},
            vertices: {}
        };
        EdgeUi.visitAllEdges(function (edge) {
            var sourceVertex = edge.getSourceVertex();
            var destinationVertex = edge.getDestinationVertex();
            var isSourceVertexSelected = sourceVertex.isSelected();
            var isDestinationVertexSelected = destinationVertex.isSelected();
            if (isSourceVertexSelected) {
                selectedGraphElements.vertices[
                    sourceVertex.getUri()
                    ] = "";
            }
            if (isDestinationVertexSelected) {
                selectedGraphElements.vertices[
                    destinationVertex.getUri()
                    ] = "";
            }
            if (isSourceVertexSelected && isDestinationVertexSelected) {
                selectedGraphElements.edges[
                    edge.getUri()
                    ] = "";
            }
        });
        VertexService.group(
            selectedGraphElements,
            GraphDisplayer.displayUsingCentralBubbleUri
        );
    };
    VertexController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
        this.getUi().beforeExpand();
        var deferred = $.Deferred().resolve();
        avoidExpandChild = avoidExpandChild || false;
        isChildExpand = isChildExpand || false;
        if (this.getUi().hasVisibleHiddenRelationsContainer()) {
            if (!this.getUi().isCollapsed()) {
                deferred = GraphDisplayer.addChildTree(
                    this.getUi()
                ).then(function () {
                    if (avoidExpandChild) {
                        return true;
                    }
                    var expandChildCalls = [];
                    this.getUi().visitClosestChildVertices(function (childVertex) {
                        if (childVertex.getModel().hasOnlyOneHiddenChild()) {
                            expandChildCalls.push(
                                childVertex.getController().expand(true, true, true)
                            );
                        }
                    });
                    return $.when.apply($, expandChildCalls);
                }.bind(this));
            }
        } else {
            deferred = this.expandDescendantsIfApplicable();
        }
        return deferred.then(function () {
            this.getUi().expand(avoidCenter, isChildExpand);
        }.bind(this));
    };

    VertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
        if (this.getUi().hasChildren()) {
            return false;
        }
        if (!IdUri.isGraphElementUriOwnedByCurrentUser(distantVertexUri)) {
            return false;
        }
        if (!IdUri.isVertexUri(distantVertexUri)) {
            return false;
        }
        var parent = this.getUi().getParentVertex();
        var grandParent = parent.getParentVertex();
        if (distantVertexUri === grandParent.getUri()) {
            return false;
        }
        var canDo = true;
        parent.visitClosestChildVertices(function (child) {
            if (distantVertexUri === child.getUri()) {
                canDo = false;
            }
        });
        return canDo;
    };

    VertexController.prototype.convertToDistantBubbleWithUri = function (distantVertexUri) {
        this.getUi().beforeConvertToDistantBubbleWithUri();
        if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
            return $.Deferred().reject();
        }
        var parent = this.getUi().getParentVertex();
        var relation = this.getUi().getParentBubble();
        return this.remove(true).then(function () {
            return parent.getController()._relateToDistantVertexWithUri(
                distantVertexUri
            ).then(function(triple){
                if(!relation.getModel().isLabelEmpty()){
                    return triple.edge().getController().setLabel(
                        relation.getModel().getLabel()
                    );
                }
                this.getUi().afterConvertToDistantBubbleWithUri();
            }.bind(this));
        }.bind(this));
    };
    VertexController.prototype._relateToDistantVertexWithUri = function (distantVertexUri) {
        return EdgeService.addToFarVertex(this.getUi(), distantVertexUri).then(function () {
            return GraphDisplayer.connectVertexToVertexWithUri(
                this.getUi(),
                distantVertexUri
            );
        }.bind(this));
    };
    api.VertexController = VertexController;
    api.addChildToRealAndUiParent = function (realParent, uiParent) {
        if (uiParent === undefined) {
            uiParent = realParent;
        }
        if (!uiParent.isExpanded()) {
            return uiParent.getController().expand().then(doIt);
        } else {
            return doIt();
        }
        function doIt() {
            var deferred = $.Deferred();
            VertexService.addRelationAndVertexToVertex(
                realParent,
                uiParent,
                function (triple) {
                    SelectionHandler.setToSingleGraphElement(
                        triple.destinationVertex()
                    );
                    return deferred.resolve(triple);
                }
            );
            return deferred.promise();
        }
    };
    return api;
});