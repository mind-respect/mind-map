/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.property_ui",
    "mr.graph-element-ui-builder",
    "mr.edge-ui-builder-common",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus"
], function ($, PropertyUi, GraphElementUiBuilder, EdgeUiBuilderCommon, GraphElementMainMenu, GraphDisplayer, EventBus) {
    "use strict";
    var api = {};

    api.completeBuild = function (property) {
        EdgeUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
            property
        );
        GraphElementUiBuilder.integrateIdentifications(
            property
        );
        property.refreshImages();
        property.reviewInLabelButtonsVisibility();
    };

    api.PropertyUiBuilder = function() {};

    api.PropertyUiBuilder.prototype.create = function (serverFacade) {
        this.serverFacade = serverFacade;
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
        propertyUi.setModel(serverFacade);
        EdgeUiBuilderCommon.buildLabel(
            propertyUi,
            this.serverFacade.getLabel(),
            PropertyUi.getWhenEmptyLabel()
        );
        this._buildMenu(
            this.html.find(".label-container"),
            propertyUi
        ).hide();
        EdgeUiBuilderCommon.buildInLabelButtons(
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
    api.PropertyUiBuilder.prototype._buildMenu = function (container, propertyUi) {
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
