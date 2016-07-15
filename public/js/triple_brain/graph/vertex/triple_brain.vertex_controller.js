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
    "triple_brain.schema_suggestion"
], function ($, VertexService, SelectionHandler, GraphDisplayer, GraphElementController, DeleteMenu, EdgeUi, ImageMenu, LinkToFarVertexMenu, IncludedGraphElementsMenu, VertexUi, Vertex, Identification, GraphElementService, SchemaSuggestion) {
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
            this.getElements()
        );
    };

    VertexController.prototype.addSiblingCanDo = function () {
        return this.isSingleAndOwned() && !this.vertices.isCenterBubble();
    };

    VertexController.prototype.addSibling = function () {
        if(this.getElements().isImmediateChildOfGroupRelation()){
            var groupRelation = this.getElements().getParentBubble().getParentBubble();
            return groupRelation.getController().addChild();
        }
        return api.addChildToRealAndUiParent(
            this.getElements().getParentVertex(),
            this.getElements().getParentBubble().getParentBubble()
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
        function deleteAfterConfirmationBehavior(vertex) {
            VertexService.remove(vertex, function (vertex) {
                var parentVertex = vertex.getParentVertex();
                vertex.remove();
                parentVertex.centerOnScreenWithAnimation();
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
                !this.isSingle() || this.vertices.isPublic()
            );
    };

    VertexController.prototype.makePrivate = function () {
        if (this.isSingle()) {
            var self = this;
            VertexService.makePrivate(this.getElements(), function () {
                self.getElements().getMakePrivateButton().addClass("hidden");
                self.getElements().getMakePublicButton().removeClass("hidden");
            });
        } else {
            VertexService.makeCollectionPrivate(this.vertices);
        }
    };

    VertexController.prototype.makePublicCanDo = function () {
        return this.isOwned() && (
                !this.isSingle() || !this.vertices.isPublic()
            );
    };

    VertexController.prototype.makePublic = function () {
        if (this.isSingle()) {
            var self = this;
            VertexService.makePublic(this.vertices, function () {
                self.vertices.getMakePrivateButton().removeClass("hidden");
                self.vertices.getMakePublicButton().addClass("hidden");
            });
        } else {
            VertexService.makeCollectionPublic(this.vertices);
        }
    };

    VertexController.prototype.subElementsCanDo = function () {
        return this.isSingle() && this.vertices.hasIncludedGraphElements();
    };

    VertexController.prototype.subElements = function () {
        IncludedGraphElementsMenu.ofVertex(
            this.vertices
        ).create();
    };

    VertexController.prototype.suggestionsCanDo = function () {
        return this.isSingle() && this.vertices.hasSuggestions();
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
    api.Self = VertexController;
    api.addChildToRealAndUiParent = function (realParent, uiParent) {
        if(uiParent === undefined){
            uiParent = realParent;
        }
        if (uiParent.hasHiddenRelationsContainer()) {
            return uiParent.addChildTree().then(doIt);
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