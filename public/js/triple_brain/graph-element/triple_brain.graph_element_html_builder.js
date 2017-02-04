/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.bubble_factory",
    "triple_brain.suggestion_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.graph_element_service",
    "triple_brain.selection_handler",
    "triple_brain.graph_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_element_ui",
    "triple_brain.edge_service",
    "triple_brain.mind_map_info"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, GraphElementService, SelectionHandler, GraphUi, GraphElementMainMenu, GraphElementUi, EdgeService, MindMapInfo) {
    "use strict";
    var enterKeyCode = 13,
        api = {};
    api.setUpLabel = function (label) {
        label.blur(function () {
            var $input = $(this),
                elementUi = BubbleFactory.fromSubHtml($input);
            if (elementUi.isSuggestion() && elementUi.hasTextChangedAfterModification()) {
                var isRelationSuggestion = elementUi.isRelationSuggestion();
                var vertexSuggestion = isRelationSuggestion ?
                    elementUi.getTopMostChildBubble() : elementUi;
                vertexSuggestion.getController().accept().then(function (newElementUi) {
                    elementUi = isRelationSuggestion ?
                        newElementUi.getParentBubble() :
                        newElementUi;
                    doIt();
                });
            } else {
                doIt();
            }
            function doIt() {
                elementUi.getModel().setLabel(elementUi.text());
                elementUi.labelUpdateHandle();
                if (!elementUi.hasTextChangedAfterModification()) {
                    return;
                }
                FriendlyResourceService.updateLabel(
                    elementUi,
                    elementUi.getModel().getLabel()
                );
            }
        }).keydown(function (event) {
            if (enterKeyCode === event.which) {
                if (!GraphUi.hasSelectedFromAutocomplete()) {
                    event.preventDefault();
                    $(this).blur();
                }
            }
        });
    };

    api.buildInLabelButtons = function (graphElement) {
        var container = $(
            "<div class='in-label-buttons'>"
        );
        GraphElementMainMenu.visitButtons(function (button) {
            if (button.canBeInLabel()) {
                var cloneHtml = button.cloneInto(container);
                var tooltipOptions = {
                    delay: {"show": 0, "hide": 0},
                    container: 'body'
                };
                if ("note" === cloneHtml.data("action")) {
                    cloneHtml.attr(
                        "title",
                        graphElement.getNote()
                    );
                    tooltipOptions.html = true;
                }
                // cloneHtml.tooltip(tooltipOptions);
            }
        });
        return container;
    };

    api.integrateIdentifications = function (graphElement) {
        $.each(graphElement.getModel().getIdentifiers(), function(){
            graphElement.addIdentification(
                this
            );
        });
    };
    api._setupChildrenContainerDragOverAndDrop = function (graphElementUi) {
        graphElementUi.getTreeContainer().on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var $this = $(this);
            $(this).closest(".vertex-tree-container").removeClass("drag-over");
            var firstOrLast = $this.parents(".left-oriented").length > 0 ?
                "last" : "first";
            var edge = BubbleFactory.fromHtml(
                $this.find(".bubble:" + firstOrLast)
            );
            if(edge.isGroupRelation()){
                return;
            }
            if (edge.isVertex()) {
                edge = edge.getParentBubble();
            }
            var dragged = GraphElementUi.getDraggedElement();
            if (dragged.getId() === edge.getId()) {
                return;
            }
            var mouseY = event.pageY;
            if (mouseY > edge.getYPosition()) {
                dragged.getController().moveUnder(
                    edge
                );
            } else {
                dragged.getController().moveAbove(
                    edge
                );
            }
        }).on("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var bubble = BubbleFactory.fromHtml(
                $(this).find(".bubble:first")
            );
            if(bubble.isGroupRelation()){
                return;
            }
            if (bubble.isVertex()) {
                bubble = bubble.getParentBubble();
            }
            var bubbleChild = bubble.getTopMostChildBubble();
            var dragged = GraphElementUi.getDraggedElement();
            if (dragged.getId() === bubble.getId() || dragged.getId() === bubbleChild.getId()) {
                return;
            }
            $(this).closest(".vertex-tree-container").addClass("drag-over");
        }).on("dragleave", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).closest(".vertex-tree-container").removeClass("drag-over");
        });
    };
    api.setupDragAndDrop = function (graphElementUi) {
        if (MindMapInfo.isViewOnly()) {
            return;
        }
        graphElementUi.getHtml().find(".in-bubble-content-wrapper").mousedown(function () {
            GraphUi.disableDragScroll();
        }).click(function () {
            GraphUi.enableDragScroll();
        }).mouseleave(function () {
            GraphUi.enableDragScroll();
        });
        graphElementUi.getHtml().on("dragstart", function (event) {
            //event.originalEvent is undefined when using jasmine and v8 :S
            if(event.originalEvent){
                event.originalEvent.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
            }
            var graphElementUi = BubbleFactory.fromHtml(
                $(this)
            );
            GraphElementUi.setDraggedElement(
                graphElementUi
            );
            GraphUi.setIsDraggingBubble(true);
            GraphUi.disableDragScroll();
            var bubbleTextOnlyElement = $('#drag-bubble-text-dump').text(
                graphElementUi.getTextOrDefault()
            );
            if(event.originalEvent){
                event.originalEvent.dataTransfer.setDragImage(bubbleTextOnlyElement[0], 0, 0);
            }

        }).on(
            "dragend", function (event) {
                event.preventDefault();
                GraphUi.setIsDraggingBubble(false);
                var bubble = BubbleFactory.fromHtml(
                    $(this)
                );
                $('#drag-bubble-text-dump').empty();
                GraphUi.enableDragScroll();
            });
        graphElementUi.getLabel().on(
            "dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                var draggedOver = BubbleFactory.fromSubHtml(
                    $(this)
                );
                draggedOver.getHtml().parents(".vertex-tree-container").removeClass("drag-over");
                var dragged = GraphElementUi.getDraggedElement();
                var shouldSetToDragOver = !draggedOver.hasDragOver() &&
                    dragged !== undefined &&
                    dragged.getUri() !== draggedOver.getUri();
                if (!shouldSetToDragOver) {
                    return;
                }
                draggedOver.enterDragOver();
            }).on(
            "dragleave", function (event) {
                event.preventDefault();
                var draggedOver = BubbleFactory.fromSubHtml(
                    $(this)
                );
                draggedOver.leaveDragOver();
            }).on(
            "drop", function (event) {
                event.preventDefault();
                event.stopPropagation();
                GraphUi.enableDragScroll();
                GraphUi.setIsDraggingBubble(false);
                var parent = BubbleFactory.fromSubHtml(
                    $(this)
                );
                parent.leaveDragOver();
                parent.getHtml().parents(
                    ".vertex-tree-container"
                ).removeClass(
                    "drag-over"
                );
                var dragged = GraphElementUi.getDraggedElement();
                if (dragged === undefined) {
                    return;
                }
                dragged.getController().moveUnderParent(
                    parent
                );
            }
        );
    };
    return api;
});