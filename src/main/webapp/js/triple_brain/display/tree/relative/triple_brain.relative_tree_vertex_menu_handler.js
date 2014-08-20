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
    "triple_brain.ui.vertex",
    "triple_brain.mind_map_info"
], function ($, VertexService, SelectionHandler, RelativeTreeVertex, UiUtils, Triple, IdentificationMenu, GraphDisplayer, VertexMenuHandlerCommon, DeleteMenu, EdgeUi, ImageMenu, LinkToFarVertexMenu, SuggestionMenu, IncludedGraphElementsMenu, Vertex, MindMapInfo) {
    "use strict";
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {},
        forGroupNotOwned = {};
    api.forSingle = function(){
        return MindMapInfo.isViewOnly() ?
            forSingleNotOwned :
            forSingle;
    };
    forSingle.addChild = function (event, sourceVertex) {
        forSingle.addChildAction(sourceVertex);
    };
    forSingle.addChildAction = function (sourceVertex) {
        VertexService.addRelationAndVertexToVertex(
            sourceVertex,
            sourceVertex
        );
    };
    forSingle.remove = function (event, vertex) {
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
    forSingle.identify = function (event, vertex) {
        event.stopPropagation();
        IdentificationMenu.ofGraphElement(
            vertex
        ).create();
    };
    forSingle.center = function (event, vertex) {
        GraphDisplayer.displayUsingCentralVertex(
            vertex
        );
    };
    forSingle.note = function (event, vertex) {
        VertexMenuHandlerCommon.forSingle().note(
            event, vertex
        );
    };
    forSingle.images = function (event, vertex) {
        ImageMenu.ofVertex(
            vertex
        ).build();
    };
    forSingle.connectTo = function (event, vertex) {
        LinkToFarVertexMenu.ofVertex(
            vertex
        ).create();
    };
    forSingle.makePrivate = function (event, vertex) {
        VertexService.makePrivate(vertex, function () {
            getMakePrivateButtons().hide();
            getMakePublicButtons().show();
        });
    };
    forSingle.makePrivateCanDo = function (vertex) {
        return vertex.isPublic();
    };
    forSingle.makePublic = function (event, vertex) {
        VertexService.makePublic(vertex, function () {
            getMakePrivateButtons().show();
            getMakePublicButtons().hide();
        });
    };
    forSingle.makePublicCanDo = function (vertex) {
        return !vertex.isPublic();
    };
    forSingle.subElements = function (event, vertex) {
        IncludedGraphElementsMenu.ofVertex(
            vertex
        ).create();
    };
    forSingle.subElementsCanDo = function (vertex) {
        return vertex.hasIncludedGraphElements();
    };
    forSingle.suggestions = function (event, vertex) {
        SuggestionMenu.ofVertex(
            vertex
        ).create();
    };
    forSingle.suggestionsCanDo = function (vertex) {
        return vertex.hasSuggestions();
    };
    function getMakePrivateButtons() {
        return $("button[data-action=makePrivate]");
    }

    function getMakePublicButtons() {
        return $("button[data-action=makePublic]");
    }
    api.forGroup = function(){
        return MindMapInfo.isViewOnly() ?
            forGroupNotOwned :
            forGroup;
    };
    forGroup.makePrivate = function(event, vertices){
        VertexService.makeCollectionPrivate(vertices);
    };
    forGroup.makePublic = function(event, vertices){
        VertexService.makeCollectionPublic(vertices);
    };
    forGroup.group = function () {
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