/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.ui.property",
    "triple_brain.edge_html_builder_common",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_displayer"
], function (PropertyUi, EdgeHtmlBuilderCommon, GraphElementMainMenu, GraphDisplayer) {
    "use strict";
    var api = {
        withServerFacade: function (serverFacade) {
            return new Self(serverFacade);
        }
    };

    function Self(serverFacade) {
        this.serverFacade = serverFacade;
    }

    Self.prototype.create = function () {
        this.html = $("<div class='property relation bubble graph-element'>").data(
            "uri",
            this.serverFacade.getUri()
        ).uniqueId();
        var inBubbleContentContainer = $("<div class='in-bubble-content'>").appendTo(
                this.html
            ),
            property = PropertyUi.withHtml(this.html);
        EdgeHtmlBuilderCommon.buildNonInputLabel(
            inBubbleContentContainer,
            this.serverFacade.getLabel(),
            PropertyUi.getWhenEmptyLabel()
        ).show();
        EdgeHtmlBuilderCommon.buildLabelAsInput(
            property,
            inBubbleContentContainer,
            PropertyUi.getWhenEmptyLabel()
        ).hide();
        this._buildMenu(inBubbleContentContainer).hide();
        this.html.append(
            $("<span class='arrow'>")
        );
        property.setTypes([]);
        property.setSameAs([]);
        property.setGenericIdentifications([]);
        $.each(this.serverFacade.getTypes(), function () {
            var typeFromServer = this;
            property.addType(
                typeFromServer
            );
        });
        $.each(this.serverFacade.getSameAs(), function () {
            var sameAsFromServer = this;
            property.addSameAs(
                sameAsFromServer
            );
        });
        property.refreshImages();
        return property;
    };
    Self.prototype._buildMenu = function(container){
        var menu = $("<div class='relation-menu'>").appendTo(
            container
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            GraphDisplayer.getPropertyMenuHandler().forSingle()
        );
        return menu;
    };
    return api;
});
