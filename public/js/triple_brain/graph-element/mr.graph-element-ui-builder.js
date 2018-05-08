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
    "triple_brain.ui_utils"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, GraphElementService, SelectionHandler, GraphUi, GraphElementMainMenu, GraphElementUi, EdgeService, MindMapInfo, UiUtils) {
    "use strict";
    var enterKeyCode = 13,
        escapeKeyCode = 27,
        api = {};
    api.completeBuild = function (graphElementUi) {
        if (graphElementUi.getModel().isLabelEmpty()) {
            graphElementUi.getHtml().addClass("empty-label");
        }
        graphElementUi.applyToOtherInstances(function (otherInstance) {
            otherInstance.reviewInLabelButtonsVisibility();
        });
        if(GraphElementUi.hasCenterBubble()){
            graphElementUi.refreshFont();
        }
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
                    if (elementUi.isSuggestion()) {
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
            var ui = BubbleFactory.fromSubHtml(
                $(this)
            );
            var text = ui.text();
            ui.applyToOtherInstances(function (otherInstance) {
                otherInstance.setText(text);
            });
        });
    };

    api.buildInLabelButtons = function (graphElementUi) {
        var container = $(
            "<div class='in-label-buttons'>"
        );
        GraphElementMainMenu.visitInLabelPossibleButtons(function (button) {
            if (!button.canBeInLabel()) {
                return;
            }
            var clonedButton = button.cloneInto(
                container
            );
            var cloneHtml = clonedButton.getHtml();
            cloneHtml.click(function () {
                var button = $(this);
                var graphElementUi = BubbleFactory.fromSubHtml(
                    button
                );
                if (!graphElementUi.isSelected()) {
                    SelectionHandler.addGraphElement(graphElementUi);
                }
                var inLabelButtonClickMethodName = button.data("action") + "InLabelClick";
                var controller = graphElementUi.getController();
                if (controller[inLabelButtonClickMethodName]) {
                    controller[inLabelButtonClickMethodName]();
                }
            });
            GraphElementMainMenu.defineTooltip(
                clonedButton, {
                    trigger: 'focus'
                }
            );
        }, graphElementUi.getModel().isLeftOriented);
        return container;
    };

    api.integrateIdentifications = function (graphElementUi) {
        $.each(graphElementUi.getModel().getIdentifiers(), function () {
            graphElementUi.addIdentification(
                this
            );
        });
    };

    api.setupContextMenu = function (graphElementUi) {
        graphElementUi.getHtml()[0].addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                BubbleFactory.fromHtml($(this)).showMenu();
                return false;
            }, false
        );
    };

    api._setupChildrenContainerDragOverAndDrop = function (graphElementUi) {
        graphElementUi.getTreeContainer().on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $("#drag-bubble-text-for-chrome").empty();
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
                dragged.getController().moveBelow(
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
            if (event.originalEvent) {
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
            var ghostImage = graphElementUi.getLabel().get(0);
            $("#drag-bubble-text-for-chrome").text(
                graphElementUi.getTextOrDefault()
            );
            if (event.originalEvent) {
                event.originalEvent.dataTransfer.setDragImage(ghostImage, 0, 0);
            }
        }).on(
            "dragend", function (event) {
                event.preventDefault();
                GraphUi.setIsDraggingBubble(false);
                $("#drag-bubble-text-for-chrome").empty();
                GraphUi.enableDragScroll();
            });
        if (UiUtils.isChrome()) {
            /*
            * In chrome only setDragImage only works for external images but does not work
            * for dom elements. That's why Im reverting to an old trick for chrome but I would rather
            * use setDragImage
            * */
            graphElementUi.getHtml().on("drag", function (event) {
                $("#drag-bubble-text-for-chrome").css("top", event.pageY).css("left", event.pageX);
            });
        }
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
                $("#drag-bubble-text-for-chrome").empty();
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
