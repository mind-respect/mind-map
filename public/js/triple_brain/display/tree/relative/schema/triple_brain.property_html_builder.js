/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.property_ui",
    "triple_brain.graph_element_html_builder",
    "triple_brain.edge_html_builder_common",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus"
], function ($, PropertyUi, GraphElementHtmlBuilder, EdgeHtmlBuilderCommon, GraphElementMainMenu, GraphDisplayer, EventBus) {
    "use strict";
    var api = {};
    api.withServerFacade = function (serverFacade) {
        return new Self(serverFacade);
    };
    api.completeBuild = function (property) {
        EdgeHtmlBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
            property
        );
        GraphElementHtmlBuilder.setUpIdentifications(
            property.getOriginalServerObject(),
            property
        );
        property.refreshImages();
        property.reviewInLabelButtonsVisibility();
    };
    function Self(serverFacade) {
        this.serverFacade = serverFacade;
    }

    Self.prototype.create = function () {
        this.html = $("<div class='property relation bubble graph-element public'>").data(
            "uri",
            this.serverFacade.getUri()
        ).uniqueId();
        $("<div class='in-bubble-content'>").appendTo(
            this.html
        );
        var property = PropertyUi.createFromHtml(
            this.html
        );
        EdgeHtmlBuilderCommon.buildLabel(
            this.html,
            this.serverFacade.getLabel(),
            PropertyUi.getWhenEmptyLabel()
        );
        property.setNote(
            this.serverFacade.getComment()
        );
        this._buildMenu(this.html.find(".label-container")).hide();
        EdgeHtmlBuilderCommon.buildInLabelButtons(
            property
        );
        this.html.append(
            $("<span class='arrow'>")
        );
        property.addImages(
            this.serverFacade.getImages()
        );
        return property;
    };
    Self.prototype._buildMenu = function (container) {
        var menu = $("<div class='relation-menu menu'>").appendTo(
            container
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            GraphDisplayer.getPropertyMenuHandler().forSingle()
        );
        return menu;
    };
    EventBus.subscribe('/event/ui/graph/drawn', function () {
        PropertyUi.visitAllProperties(api.completeBuild);
    });
    return api;
});
