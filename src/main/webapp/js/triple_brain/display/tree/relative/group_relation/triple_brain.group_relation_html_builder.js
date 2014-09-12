/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.relative_tree_displayer_templates",
        "triple_brain.ui.group_relation",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_main_menu",
        "triple_brain.graph_displayer",
        "jquery-ui"
    ],
    function (RelativeTreeTemplates, GroupRelationUi, SelectionHandler, GraphElementMainMenu, GraphDisplayer) {
        var api = {
            withServerFacade: function (serverFacade) {
                return new Self(serverFacade);
            }
        };

        function Self(serverFacade) {
            this.serverFacade = serverFacade;
        }

        Self.prototype.create = function () {
            this.html = $(
                RelativeTreeTemplates['group_relation'].merge()
            ).data("group_relation", this.serverFacade);
            this._addLabel();
            this._addArrow();
            this._handleClick();
            this._createMenu();
            var groupRelation = GroupRelationUi.withHtml(
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
            this.html[
                this.serverFacade.isLeftOriented ?
                    "prepend" :
                    "append"
                ](
                menu
            );
        };

        Self.prototype._handleClick = function () {
            this.html.click(function (event) {
                event.stopPropagation();
                SelectionHandler.setToSingleGroupRelation(
                    GroupRelationUi.withHtml(
                        $(this)
                    )
                );
            });
        };

        Self.prototype._addLabel = function () {
            var labelHtml = $(
                RelativeTreeTemplates['group_relation_label_container'].merge({
                    label: this.serverFacade.getIdentification().getLabel()
                })
            ).appendTo(this.html);
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
        return api;
    }
);