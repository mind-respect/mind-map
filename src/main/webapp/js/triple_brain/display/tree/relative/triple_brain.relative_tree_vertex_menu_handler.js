/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.vertex",
    "triple_brain.selection_handler",
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.utils",
    "triple_brain.ui.triple",
    "triple_brain.ui.identification_menu",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_menu_handler_common",
    "triple_brain.delete_menu",
    "triple_brain.ui.edge",
    "triple_brain.image_menu",
    "triple_brain.link_to_far_vertex_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.included_graph_elements_menu",
    "triple_brain.ui.vertex"
], function ($, VertexService, SelectionHandler, RelativeTreeVertex, UiUtils, Triple, IdentificationMenu, GraphDisplayer, VertexMenuHandlerCommon, DeleteMenu, EdgeUi, ImageMenu, LinkToFarVertexMenu, SuggestionMenu, IncludedGraphElementsMenu, Vertex) {
    var api = {};
    api.forSingle = {};
    api.forSingle.addChild = function (event, sourceVertex) {
        api.forSingle.addChildAction(sourceVertex);
    };
    api.forSingle.addChildAction = function (sourceVertex) {
        VertexService.addRelationAndVertexToVertex(
            sourceVertex,
            sourceVertex
        );
    };
    api.forSingle.remove = function (event, vertex) {
        if (vertex.isAbsoluteDefaultVertex()) {
            return;
        }
        DeleteMenu.ofVertexAndDeletionBehavior(
            vertex,
            deleteAfterConfirmationBehavior
        ).build();
        function deleteAfterConfirmationBehavior(event, vertex) {
            event.stopPropagation();
            VertexService.remove(vertex, function (vertex) {
                removeChildren(vertex);
                RelativeTreeVertex.ofVertex(vertex).applyToOtherInstances(function (vertex) {
                    removeChildren(vertex);
                    removeEdges(vertex);
                });
                RelativeTreeVertex.removeVertexFromCache(
                    vertex.getUri(),
                    vertex.getId()
                );
                Vertex.removeVertexFromCache(
                    vertex.getUri(),
                    vertex.getId()
                );
                removeEdges(vertex);
                function removeChildren(vertex) {
                    var relativeVertex = RelativeTreeVertex.ofVertex(
                        vertex
                    );
                    relativeVertex.visitVerticesChildren(function (childVertex) {
                        vertex.removeConnectedEdges();
                        childVertex.remove();
                    });
                }

                function removeEdges(vertex) {
                    vertex.removeConnectedEdges();
                    vertex.remove();
                }
            });
        }
    };
    api.forSingle.identify = function (event, vertex) {
        event.stopPropagation();
        IdentificationMenu.ofGraphElement(
            vertex
        ).create();
    };
    api.forSingle.center = function (event, vertex) {
        GraphDisplayer.displayUsingCentralVertex(
            vertex
        );
    };
    api.forSingle.note = function (event, vertex) {
        VertexMenuHandlerCommon.forSingle().note(
            event, vertex
        );
    };
    api.forSingle.images = function (event, vertex) {
        ImageMenu.ofVertex(
            vertex
        ).build();
    };
    api.forSingle.connectTo = function (event, vertex) {
        LinkToFarVertexMenu.ofVertex(
            vertex
        ).create();
    };
    api.forSingle.makePrivate = function (event, vertex) {
        VertexService.makePrivate(vertex, function () {
            getMakePrivateButtons().hide();
            getMakePublicButtons().show();
        });
    };
    api.forSingle.makePrivateCanDo = function (vertex) {
        return vertex.isPublic();
    };
    api.forSingle.makePublic = function (event, vertex) {
        VertexService.makePublic(vertex, function () {
            getMakePrivateButtons().show();
            getMakePublicButtons().hide();
        });
    };
    api.forSingle.makePublicCanDo = function (vertex) {
        return !vertex.isPublic();
    };
    api.forSingle.subElements = function (event, vertex) {
        IncludedGraphElementsMenu.ofVertex(
            vertex
        ).create();
    };
    api.forSingle.subElementsCanDo = function (vertex) {
        return vertex.hasIncludedGraphElements();
    };
    api.forSingle.suggestions = function (event, vertex) {
        SuggestionMenu.ofVertex(
            vertex
        ).create();
    };
    api.forSingle.suggestionsCanDo = function (vertex) {
        return vertex.hasSuggestions();
    };
    function getMakePrivateButtons() {
        return $("button[data-action=makePrivate]");
    }

    function getMakePublicButtons() {
        return $("button[data-action=makePublic]");
    }
    api.forGroup = {};
    api.forGroup.group = function () {
        var selectedGraphElements = {
            edges: {},
            vertices: {}
        };
        EdgeUi.visitAllEdges(function (edge) {
            var sourceVertex = edge.sourceVertex();
            var destinationVertex = edge.destinationVertex();
            var isSourceVertexSelected = sourceVertex.isSelected();
            var isDestinationVertexSelected = destinationVertex.isSelected();
            if (isSourceVertexSelected) {
                selectedGraphElements.vertices[
                    sourceVertex.getUri()
                    ] = ""
            }
            if (isDestinationVertexSelected) {
                selectedGraphElements.vertices[
                    destinationVertex.getUri()
                    ] = ""
            }
            if (isSourceVertexSelected && isDestinationVertexSelected) {
                selectedGraphElements.edges[
                    edge.getUri()
                    ] = "";
            }
        });
        VertexService.group(
            selectedGraphElements,
            GraphDisplayer.displayUsingCentralVertexUri
        );
    };
    return api;
});