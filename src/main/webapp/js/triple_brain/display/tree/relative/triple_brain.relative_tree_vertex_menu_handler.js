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
    "triple_brain.included_graph_elements_menu"
], function($, VertexService, SelectionHandler, RelativeTreeVertex, UiUtils, Triple, IdentificationMenu, GraphDisplayer, VertexMenuHandlerCommon, DeleteMenu, EdgeUi, ImageMenu, LinkToFarVertexMenu, SuggestionMenu, IncludedGraphElementsMenu){
    var api = {};
    api.forSingle = function () {
        var subApi = {};
        subApi.addChild = function(event, vertex){
            var sourceVertex = vertex;
            VertexService.addRelationAndVertexToVertex(
                sourceVertex, function (triple, tripleServerFormat) {
                    var sourceVertex = RelativeTreeVertex.ofVertex(
                        triple.sourceVertex()
                    );
                    var destinationHtml = triple.destinationVertex().getHtml();
                    if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                        destinationHtml.centerOnScreenWithAnimation();
                    }
                    RelativeTreeVertex.ofVertex(
                        triple.destinationVertex()
                    ).resetOtherInstances();
                    sourceVertex.applyToOtherInstances(function (vertex) {
                        Triple.createUsingServerTriple(
                            vertex,
                            tripleServerFormat
                        );
                    });
                }
            );
        };
        subApi.remove = function(event, vertex){
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
                    removeEdges(vertex);
                    EdgeUi.redrawAllEdges();
                    function removeChildren(vertex) {
                        var relativeVertex = RelativeTreeVertex.ofVertex(
                            vertex
                        );
                        relativeVertex.visitChildren(function (childVertex) {
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
        subApi.identify = function(event, vertex){
            event.stopPropagation();
            IdentificationMenu.ofGraphElement(
                vertex
            ).create();
        };
        subApi.center = function(event, vertex){
            GraphDisplayer.displayUsingNewCentralVertex(
                vertex
            );
        };
        subApi.note = function(event, vertex){
            VertexMenuHandlerCommon.forSingle().note(
                event, vertex
            );
        };
        subApi.images = function(event, vertex){
            ImageMenu.ofVertex(
                vertex
            ).build();
        };
        subApi.connectTo = function(event, vertex){
            LinkToFarVertexMenu.ofVertex(
                vertex
            ).create();
        };
        subApi.makePrivate = function(event, vertex){
            VertexService.makePrivate(vertex, function(){
                getMakePrivateButtons().hide();
                getMakePublicButtons().show();
            });
        };
        subApi.makePrivateCanDo = function(vertex){
            return vertex.isPublic();
        };
        subApi.makePublic = function(event, vertex){
            VertexService.makePublic(vertex, function(){
                getMakePrivateButtons().show();
                getMakePublicButtons().hide();
            });
        };
        subApi.makePublicCanDo = function(vertex){
            return !vertex.isPublic();
        };
        subApi.subElements = function(event, vertex){
            IncludedGraphElementsMenu.ofVertex(
                vertex
            ).create();
        };
        subApi.subElementsCanDo = function(vertex){
            return vertex.hasIncludedGraphElements();
        };
        subApi.suggestions = function(event, vertex){
            SuggestionMenu.ofVertex(
                vertex
            ).create();
        };
        subApi.suggestionsCanDo = function(vertex){
            return vertex.hasSuggestions();
        };
        return subApi;
        function getMakePrivateButtons(){
            return $("button[data-action=makePrivate]");
        }
        function getMakePublicButtons(){
            return $("button[data-action=makePublic]");
        }
    };
    api.forGroup  = function(){
        var subApi = {};
        subApi.group = function(){
            SelectionHandler.handleGroupButtonClick();
        };
        return subApi;
    };
    return api;
});