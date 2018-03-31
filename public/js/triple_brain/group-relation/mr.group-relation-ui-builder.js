/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.relative_tree_displayer_templates",
        "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
        "triple_brain.group_relation_ui",
        "triple_brain.group_relation",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_main_menu",
        "triple_brain.graph_displayer",
        "triple_brain.event_bus",
        "triple_brain.identification",
        "mr.graph-element-ui-builder",
        "mr.edge-ui-builder-common",
        "triple_brain.mind_map_info",
        "triple_brain.bubble_factory"
    ],
    function ($, RelativeTreeTemplates, PropertiesIndicator, GroupRelationUi, GroupRelation, SelectionHandler, GraphElementMainMenu, GraphDisplayer, EventBus, Identification, GraphElementUiBuilder, EdgeUiBuilderCommon, MindMapInfo, BubbleFactory) {
        "use strict";
        var api = {},
            NUMBER_OF_SIBLINGS_UNDER_WHICH_YOU_SHOULD_EXPAND = 4,
            NUMBER_OF_CHILDREN_UNDER_WHICH_YOU_SHOULD_EXPAND = 6;
        api.completeBuild = function (groupRelationUi) {
            groupRelationUi.buildHiddenNeighborPropertiesIndicator();
            groupRelationUi.addIdentification(
                groupRelationUi.getModel().getIdentification()
            );
            groupRelationUi.refreshImages();
            var hasFewEnoughSiblingsToExpandAutomatically = groupRelationUi.getParentBubble().getNumberOfChild() < NUMBER_OF_SIBLINGS_UNDER_WHICH_YOU_SHOULD_EXPAND;
            var hasFewEnoughChildrenToExpandAutomatically = groupRelationUi.getModel().getNumberOfVertices() < NUMBER_OF_CHILDREN_UNDER_WHICH_YOU_SHOULD_EXPAND;
            if (hasFewEnoughSiblingsToExpandAutomatically && hasFewEnoughChildrenToExpandAutomatically) {
                GraphDisplayer.expandGroupRelation(
                    groupRelationUi
                );
            }
            GraphElementUiBuilder._setupChildrenContainerDragOverAndDrop(
                groupRelationUi
            );
            groupRelationUi.reviewInLabelButtonsVisibility();
            groupRelationUi.reviewIsSameAsGroupRelation();
            if (!MindMapInfo.isViewOnly()) {
                GraphElementUiBuilder.setupDrag(
                    groupRelationUi
                );
            }
            // groupRelationUi.visitAllChild(function(child){
            //     if(child.isGroupRelation()){
            //         api.completeBuild(child);
            //     }
            // });
        };

        api.GroupRelationUiBuilder = function () {
        };

        api.GroupRelationUiBuilder.prototype.create = function (serverFacade) {
            this.serverFacade = serverFacade;
            this.html = $(
                RelativeTreeTemplates['group_relation'].merge()
            ).data(
                "group_relation",
                this.serverFacade
            ).append(
                "<div class='in-bubble-content'>"
            );
            this.html.uniqueId();
            this._addLabel();
            this._addArrow();
            var groupRelationUi = GroupRelationUi.createFromHtml(
                this.html
            );
            this._createMenu(groupRelationUi);
            groupRelationUi.setUri(
                /*
                 * todo should not set the uri to the first identifier but it's just
                 * to make the update group relation label work. Should think of a better solution
                 */
                this.serverFacade.getIdentifiers()[0].getUri()
            );
            EdgeUiBuilderCommon.buildInLabelButtons(
                groupRelationUi
            );
            groupRelationUi.hideMenu();
            GraphElementUiBuilder.setupDrop(
                groupRelationUi
            );
            return groupRelationUi;
        };

        api.GroupRelationUiBuilder.prototype._createMenu = function (groupRelationUi) {
            var menu = $("<div class='menu'>");
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                groupRelationUi.getController()
            );
            this.html.find(".label-container")[
                this.serverFacade.isLeftOriented ?
                    "prepend" :
                    "append"
                ](
                menu
            );
            GraphElementUiBuilder.setupContextMenu(groupRelationUi);
        };

        api.GroupRelationUiBuilder.prototype._addLabel = function () {
            var container = $("<div class='label-container'>").appendTo(
                this.html.find(".in-bubble-content")
            );
            var labelAndButtons = $(
                "<div class='label label-info label-and-buttons'>"
            );
            var labelHtml = $(
                "<div class='bubble-label'>"
            ).text(
                this.serverFacade.getIdentification().getLabel()
            ).on("mousedown", function (event) {
                    event.stopPropagation();
                    SelectionHandler.setToSingleGraphElement(
                        GroupRelationUi.withHtml(
                            $(this).closest(".group-relation")
                        )
                    );
                }
            ).appendTo(labelAndButtons);
            labelHtml.attr(
                "data-placeholder",
                GroupRelationUi.getWhenEmptyLabel()
            );
            if (!MindMapInfo.isViewOnly()) {
                labelHtml.on(
                    "dblclick",
                    function (event) {
                        event.stopPropagation();
                        var groupRelation = BubbleFactory.fromSubHtml(
                            $(this)
                        );
                        if (groupRelation.isInEditMode()) {
                            return;
                        }
                        groupRelation.deselect();
                        groupRelation.hideMenu();
                        groupRelation.focus();
                    }
                );
            }
            labelAndButtons.appendTo(container);
            GraphElementUiBuilder.setUpLabel(labelHtml);
        };

        api.GroupRelationUiBuilder.prototype._addArrow = function () {
            this.html.append("<span class='arrow'>");
        };
        EventBus.subscribe(
            "/event/ui/group_relation/visit_after_graph_drawn",
            function (event, groupRelationUi) {
                api.completeBuild(groupRelationUi);
            }
        );
        EventBus.subscribe(
            "/event/ui/graph/identification/added",
            function (event, graphElement, identification) {
                var parentBubble = graphElement.getParentBubble();
                if (parentBubble.isGroupRelation()) {
                    parentBubble.setUri(
                        identification.getUri()
                    );
                    return;
                }
                parentBubble.visitAllImmediateChild(function (child) {
                    if (child.isGroupRelation()) {
                        var isSameIdentification =
                            child.getGroupRelation().getIdentification().getExternalResourceUri() ===
                            identification.getExternalResourceUri();
                        if (isSameIdentification) {
                            graphElement.moveToParent(child);
                            return false;
                        }
                    }
                    if (child.isRelation() && !child.isSameBubble(graphElement)) {
                        var childAsAnIdentification = Identification.fromFriendlyResource(
                            child.getModel()
                        );
                        var isIdentifiedToRelation = graphElement.getModel().hasIdentification(
                            childAsAnIdentification
                        );
                        if (isIdentifiedToRelation) {
                            var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                                [childAsAnIdentification],
                                parentBubble
                            );
                            newGroupRelation.setUri(
                                identification.getUri()
                            );
                            child.moveToParent(newGroupRelation);
                            graphElement.moveToParent(newGroupRelation);
                            return;
                        }
                        $.each(child.getModel().getIdentifiers(), function () {
                            var identification = this;
                            if (graphElement.getModel().hasIdentification(identification)) {
                                var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                                    [identification],
                                    parentBubble
                                );
                                newGroupRelation.setUri(
                                    identification.getUri()
                                );
                                child.moveToParent(newGroupRelation);
                                graphElement.moveToParent(newGroupRelation);
                                return false;
                            }
                        });
                    }
                });
            }
        );
        EventBus.subscribe(
            "/event/ui/graph/identification/removed",
            function (event, graphElement, identification) {
                if (graphElement.isRemoved()) {
                    return;
                }
                var parentBubble = graphElement.getParentBubble();
                var shouldMove = parentBubble.isGroupRelation() &&
                    parentBubble.getModel().hasIdentification(identification);
                if (!shouldMove) {
                    return;
                }
                graphElement.moveToParent(
                    parentBubble.getParentBubble()
                );
            }
        );
        return api;
    }
);
