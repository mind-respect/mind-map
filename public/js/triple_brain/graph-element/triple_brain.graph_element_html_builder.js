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
    "triple_brain.mind_map_info",
    "triple_brain.id_uri"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, GraphElementService, SelectionHandler, GraphUi, GraphElementMainMenu, GraphElementUi, EdgeService, MindMapInfo, IdUri) {
    "use strict";
    var enterKeyCode = 13,
        escapeKeyCode = 27,
        api = {};
    api.completeBuild = function(graphElementUi){
        graphElementUi.applyToOtherInstances(function (otherInstance) {
            otherInstance.reviewInLabelButtonsVisibility();
        });
    };
    api.setUpLabel = function (label) {
        label.blur(function (event) {
            var $input = $(this),
                elementUi = BubbleFactory.fromSubHtml($input);
            if (elementUi.isSuggestion() && elementUi.hasTextChangedAfterModification()) {
                var isRelationSuggestion = elementUi.isRelationSuggestion();
                var vertexSuggestion = isRelationSuggestion ?
                    elementUi.getTopMostChildBubble() : elementUi;
                vertexSuggestion.getController().accept().then(function (newElementUi) {
                    if(elementUi.isSuggestion()){
                        SelectionHandler.removeAll();
                    }
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
            if ([enterKeyCode, escapeKeyCode].indexOf(event.which) !== -1) {
                if (!GraphUi.hasSelectedFromAutocomplete()) {
                    event.preventDefault();
                    $(this).blur();
                }
            }
        });
    };

    api.buildInLabelButtons = function (graphElementUi) {
        var container = $(
            "<div class='in-label-buttons'>"
        );
        GraphElementMainMenu.visitButtons(function (button) {
            if (!button.canBeInLabel()) {
                return;
            }
            var clonedButton = button.cloneInto(container);
            var cloneHtml = clonedButton.getHtml();
            cloneHtml.click(function(){
                var graphElementUi = BubbleFactory.fromSubHtml(
                    $(this)
                );
                if (!graphElementUi.isSelected()) {
                    SelectionHandler.addGraphElement(graphElementUi);
                }
            });
            GraphElementMainMenu.defineTooltip(
                clonedButton,{
                    trigger:'hover'
                }
            );
        });
        return container;
    };

    api.integrateIdentifications = function (graphElementUi) {
        $.each(graphElementUi.getModel().getIdentifiers(), function(){
            graphElementUi.addIdentification(
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
    api.setupDrag = function (graphElementUi) {
        graphElementUi.getHtml().prop(
            "draggable",
            "true"
        );
        graphElementUi.getHtml().on("dragstart", function (event) {
            //event.originalEvent is undefined when using jasmine and v8 :S
            if(event.originalEvent){
                event.originalEvent.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
            }
            var graphElementUi = BubbleFactory.fromHtml(
                $(this)
            );
            graphElementUi.hideMenu();
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
    };
    api.setupDrop = function (graphElementUi) {
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
        graphElementUi.getDropContainer().on(
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