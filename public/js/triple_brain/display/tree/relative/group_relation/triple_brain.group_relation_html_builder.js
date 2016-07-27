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
        "triple_brain.graph_element_html_builder",
        "triple_brain.edge_html_builder_common",
        "jquery-ui"
    ],
    function ($, RelativeTreeTemplates, PropertiesIndicator, GroupRelationUi, GroupRelation, SelectionHandler, GraphElementMainMenu, GraphDisplayer, EventBus, Identification, GraphElementHtmlBuilder, EdgeHtmlBuilderCommon) {
        "use strict";
        var api = {},
            NUMBER_OF_SIBLINGS_UNDER_WHICH_YOU_SHOULD_EXPAND = 4;
        api.withServerFacade = function (serverFacade) {
            return new Self(serverFacade);
        };
        api.completeBuild = function (groupRelationUi) {
            var indicator = PropertiesIndicator.withVertex(
                groupRelationUi
            );
            groupRelationUi.setHiddenRelationsContainer(
                indicator
            );
            groupRelationUi.integrateIdentification(
                groupRelationUi.getModel().getIdentification()
            );
            groupRelationUi.refreshImages();
            indicator.build();
            var shouldExpand = groupRelationUi.getParentBubble().getNumberOfChild() < NUMBER_OF_SIBLINGS_UNDER_WHICH_YOU_SHOULD_EXPAND;
            if (shouldExpand) {
                GraphDisplayer.expandGroupRelation(
                    groupRelationUi
                );
            }
            groupRelationUi.reviewInLabelButtonsVisibility();
        };

        function Self(serverFacade) {
            this.serverFacade = serverFacade;
        }

        Self.prototype.create = function () {
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
            groupRelationUi.setGenericIdentifications(
                groupRelationUi.getModel().getIdentifiers()
            );
            EdgeHtmlBuilderCommon.buildInLabelButtons(
                groupRelationUi
            );
            groupRelationUi.hideButtons();
            GraphElementHtmlBuilder.setupDragAndDrop(
                groupRelationUi
            );
            GraphElementHtmlBuilder._setupChildrenContainerDragOverAndDrop(
                groupRelationUi
            );
            return groupRelationUi;
        };

        Self.prototype._createMenu = function (groupRelationUi) {
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
        };

        Self.prototype._addLabel = function () {
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
            ).click(function (event) {
                    event.stopPropagation();
                    SelectionHandler.setToSingleGroupRelation(
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
            labelAndButtons.appendTo(container);
            GraphElementHtmlBuilder.setUpLabel(labelHtml);
            this._setupDescriptionOnLabel(labelAndButtons);
        };

        Self.prototype._setupDescriptionOnLabel = function (labelHtml) {
            var identification = this.serverFacade.getIdentification();
            labelHtml.attr(
                "data-toggle", "popover"
            ).attr(
                "title", identification.getLabel()
            ).attr(
                "data-content", identification.getComment()
            ).popover({
                    container: "body",
                    placement: this.serverFacade.isLeftOriented ? "right" : "left",
                    trigger: "manual"
                }
            );
        };

        Self.prototype._addArrow = function () {
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
                    return;
                }
                parentBubble.visitAllChild(function (child) {
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
                        var isIdentifiedToRelation = graphElement.hasIdentification(
                            childAsAnIdentification
                        );
                        if (isIdentifiedToRelation) {
                            var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                                childAsAnIdentification,
                                parentBubble
                            );
                            child.moveToParent(newGroupRelation);
                            graphElement.moveToParent(newGroupRelation);
                            return;
                        }
                        $.each(child.getIdentifications(), function () {
                            var identification = this;
                            if (graphElement.hasIdentification(identification)) {
                                var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                                    identification,
                                    parentBubble
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
            function (event, graphElement) {
                var parentBubble = graphElement.getParentBubble();
                if (!parentBubble.isGroupRelation()) {
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