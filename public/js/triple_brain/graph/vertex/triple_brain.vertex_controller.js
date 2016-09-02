/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_service",
    "triple_brain.selection_handler",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_controller",
    "triple_brain.delete_menu",
    "triple_brain.edge_ui",
    "triple_brain.image_menu",
    "triple_brain.link_to_far_vertex_menu",
    "triple_brain.included_graph_elements_menu",
    "triple_brain.vertex_ui",
    "triple_brain.vertex",
    "triple_brain.identification",
    "triple_brain.graph_element_service",
    "triple_brain.schema_suggestion",
    "triple_brain.event_bus"
], function ($, VertexService, SelectionHandler, GraphDisplayer, GraphElementController, DeleteMenu, EdgeUi, ImageMenu, LinkToFarVertexMenu, IncludedGraphElementsMenu, VertexUi, Vertex, Identification, GraphElementService, SchemaSuggestion, EventBus) {
    "use strict";
    var api = {};

    function VertexController(vertices) {
        this.vertices = vertices;
        GraphElementController.Self.prototype.init.call(
            this,
            this.vertices
        );
    }

    VertexController.prototype = new GraphElementController.Self();

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
        return api.addChildToRealAndUiParent(
            this.getUi().getParentVertex(),
            this.getUi().getParentBubble().getParentBubble()
        );
    };

    VertexController.prototype.removeCanDo = function () {
        return this.isSingleAndOwned();
    };

    VertexController.prototype.remove = function (skipConfirmation) {
        if (skipConfirmation) {
            deleteAfterConfirmationBehavior(this.vertices);
            return;
        }
        DeleteMenu.ofVertexAndDeletionBehavior(
            this.vertices,
            deleteAfterConfirmationBehavior
        ).build();
        function deleteAfterConfirmationBehavior(vertexUi) {
            VertexService.remove(
                vertexUi
            ).then(function () {
                vertexUi.remove();
            });
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

    VertexController.prototype.connectToCanDo = function () {
        return this.isSingleAndOwned();
    };

    VertexController.prototype.connectTo = function () {
        LinkToFarVertexMenu.ofVertex(
            this.vertices
        ).create();
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
            VertexService.makePrivate(this.getUi(), function () {
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
            return GraphElementService.addIdentificationAjax(
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
    VertexController.prototype.expand = function (avoidCenter) {
        var deferred = $.Deferred().resolve();
        var self = this;
        if (this.getUi().hasVisibleHiddenRelationsContainer()) {
            if (!this.getUi().isCollapsed()) {
                deferred = GraphDisplayer.addChildTree(
                    this.getUi()
                );
            }
        } else {
            deferred = this.expandDescendantsIfApplicable();
        }
        return deferred.done(function () {
            self.getUi().expand(avoidCenter);
        });
    };
    api.Self = VertexController;
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