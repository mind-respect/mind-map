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
            property.getModel(),
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
        var propertyUi = PropertyUi.createFromHtml(
            this.html
        );
        EdgeHtmlBuilderCommon.buildLabel(
            this.html,
            this.serverFacade.getLabel(),
            PropertyUi.getWhenEmptyLabel()
        );
        propertyUi.setNote(
            this.serverFacade.getComment()
        );
        this._buildMenu(
            this.html.find(".label-container"),
            propertyUi
        ).hide();
        EdgeHtmlBuilderCommon.buildInLabelButtons(
            propertyUi
        );
        this.html.append(
            $("<span class='arrow'>")
        );
        propertyUi.addImages(
            this.serverFacade.getImages()
        );
        return propertyUi;
    };
    Self.prototype._buildMenu = function (container, propertyUi) {
        var menu = $("<div class='relation-menu menu'>").appendTo(
            container
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            propertyUi.getController()
        );
        return menu;
    };
    EventBus.subscribe('/event/ui/graph/drawn', function () {
        PropertyUi.visitAllProperties(api.completeBuild);
    });
    return api;
});
