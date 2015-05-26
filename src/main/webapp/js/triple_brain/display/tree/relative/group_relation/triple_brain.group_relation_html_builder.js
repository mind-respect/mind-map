/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.relative_tree_displayer_templates",
        "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
        "triple_brain.group_relation_ui",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_main_menu",
        "triple_brain.graph_displayer",
        "triple_brain.event_bus",
        "jquery-ui"
    ],
    function (RelativeTreeTemplates, PropertiesIndicator, GroupRelationUi, SelectionHandler, GraphElementMainMenu, GraphDisplayer, EventBus) {
        var api = {};
        api.withServerFacade = function (serverFacade) {
            return new Self(serverFacade);
        };
        api.completeBuild = function(groupRelationUi){
            var indicator = PropertiesIndicator.withVertex(
                groupRelationUi
            );
            groupRelationUi.setHiddenRelationsContainer(
                indicator
            );
            groupRelationUi.integrateIdentification(
                groupRelationUi.getOriginalServerObject().getIdentification()
            );
            groupRelationUi.refreshImages();
            indicator.build();
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
            this._createMenu();
            var groupRelation = GroupRelationUi.createFromHtml(
                this.html
            );
            groupRelation.hideButtons();
            return groupRelation;
        };

        Self.prototype._createMenu = function () {
            var menu = $("<div class='menu'>");
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                GraphDisplayer.getGroupRelationMenuHandler().forSingle()
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
            var labelHtml = $(
                "<div class='bubble-label label label-info'>"
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
            ).appendTo(container);
            this._setupDescriptionOnLabel(labelHtml);
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
        return api;
    }
);