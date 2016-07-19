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
    "triple_brain.graph_displayer",
    "triple_brain.identification"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, GraphElementService, SelectionHandler, GraphUi, GraphElementMainMenu, GraphElementUi, EdgeService, MindMapInfo, GraphDisplayer, Identification) {
    "use strict";
    var enterKeyCode = 13,
        api = {};
    api.setUpLabel = function (label) {
        label.blur(function () {
            var $input = $(this),
                elementUi = BubbleFactory.fromSubHtml($input);
            elementUi.getModel().setLabel(elementUi.text());
            elementUi.labelUpdateHandle();
            if (!elementUi.hasTextChangedAfterModification()) {
                return;
            }
            if (elementUi.isSuggestion()) {
                var vertexSuggestion = elementUi.isRelationSuggestion() ?
                    elementUi.getTopMostChildBubble() : elementUi;
                vertexSuggestion.getController().accept().then(updateLabelToService);
            } else {
                updateLabelToService();
            }
            function updateLabelToService() {
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
                if ("note" === cloneHtml.data("action")) {
                    var noteWithoutHtml = $("<div/>").html(
                        graphElement.getNote()
                    ).text();
                    cloneHtml.attr(
                        "title",
                        noteWithoutHtml
                    );
                }
            }
        });
        return container;
    };

    api.setUpIdentifications = function (serverFormat, graphElement) {
        setup(
            graphElement.setTypes,
            serverFormat.getTypes,
            graphElement.addType
        );
        setup(
            graphElement.setSameAs,
            serverFormat.getSameAs,
            graphElement.addSameAs
        );
        setup(
            graphElement.setGenericIdentifications,
            serverFormat.getGenericIdentifications,
            graphElement.addGenericIdentification
        );
        function setup(identificationsSetter, identificationGetter, addFctn) {
            identificationsSetter.call(graphElement, []);
            $.each(identificationGetter.call(serverFormat, []), function () {
                var identificationFromServer = this;
                addFctn.call(
                    graphElement,
                    identificationFromServer
                );
            });
        }
    };
    api._setupChildrenContainerDragOverAndDrop = function (graphElementUi) {
        graphElementUi.getTreeContainer().on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var bubble = BubbleFactory.fromHtml(
                $(this).find(".bubble:first")
            );
            var dragged = GraphElementUi.getDraggedElement();
            
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
            if (GraphUi.isThereAnOpenModal() || GraphUi.isDragScrollEnabled()) {
                return;
            }
            GraphUi.enableDragScroll();
        });
        graphElementUi.getHtml().on("dragstart", function (event) {
            if (event.originalEvent) {
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
            graphElementUi.hideMenu();
            graphElementUi.hideHiddenRelationsContainer();
            graphElementUi.getArrowHtml().addClass("hidden");
            graphElementUi.getHtml().addClass(
                "dragged"
            ).data(
                "original-parent",
                graphElementUi.getParentVertex()
            );
        }).on(
            "dragend", function (event) {
                event.preventDefault();
                GraphUi.setIsDraggingBubble(false);
                var bubble = BubbleFactory.fromHtml(
                    $(this)
                );
                bubble.getArrowHtml().removeClass(
                    "hidden"
                );
                bubble.showHiddenRelationsContainer();
                GraphUi.enableDragScroll();
            });
        graphElementUi.getLabel().on(
            "dragover", function (event) {
                event.preventDefault();
                var draggedOver = BubbleFactory.fromSubHtml(
                    $(this)
                );
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
                var dragged = GraphElementUi.getDraggedElement();
                if (dragged === undefined) {
                    return;
                }
                var shouldMove = dragged.getUri() !== parent.getUri() && !dragged.isBubbleAChild(parent);
                if (!shouldMove) {
                    return;
                }

                if (parent.isRelation()) {
                    var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                        Identification.fromFriendlyResource(
                            parent.getModel()
                        ),
                        parent.getParentBubble(),
                        parent.isToTheLeft()
                    );
                    parent.moveToParent(newGroupRelation);
                    parent = newGroupRelation;
                }
                var newSourceVertex = parent.isVertex() ?
                    parent :
                    parent.getParentVertex();
                var movedEdge = dragged.isRelation() ?
                    dragged :
                    dragged.getParentBubble();
                var previousParentGroupRelation = movedEdge.getParentBubble();
                dragged.moveToParent(
                    parent
                );
                if (parent.isGroupRelation()) {
                    var identification = parent.getGroupRelation().getIdentification();
                    EdgeService.addSameAs(
                        movedEdge,
                        identification
                    );
                }
                EdgeService.changeSourceVertex(
                    newSourceVertex,
                    movedEdge
                );
                if (previousParentGroupRelation.isGroupRelation()) {
                    GraphElementService.removeIdentification(
                        movedEdge,
                        movedEdge.getIdentificationWithExternalUri(
                            previousParentGroupRelation.getModel().getIdentification().getExternalResourceUri()
                        )
                    );
                }
            }
        );
    };
    return api;
});