/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.edge_html_builder_common",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.identification"
], function ($, EdgeHtmlBuilderCommon, SuggestionRelationUi, GraphElementMainMenu, Identification) {
    "use strict";
    var api = {};
    api.withServerFacade = function (serverFacade) {
        return new Self(serverFacade);
    };

    api.afterChildBuilt = function(suggestionRelationUi){
        suggestionRelationUi.setTypes([]);
        var serverFacade = suggestionRelationUi.getOriginalServerObject();
        suggestionRelationUi.setSameAs([
            Identification.withUriLabelAndDescription(
                serverFacade.getSameAs().getUri(),
                serverFacade.getLabel(),
                serverFacade.getSameAs().getComment()
            )
        ]);
        suggestionRelationUi.setGenericIdentifications([]);
        suggestionRelationUi.getHtml().closest(
            ".vertex-tree-container"
        ).find("> .vertical-border").addClass("small");
    };

    function Self(serverFacade) {
        this.serverFacade = serverFacade;
    }

    Self.prototype.create = function () {
        this.html = $(
            "<div class='suggestion relation graph-element bubble'>"
        ).data(
            "uri",
            this.serverFacade.getUri()
        ).uniqueId().append(
            "<span class='connector'>"
        ).append("<div class='in-bubble-content'>");
        var label = this.serverFacade.isLabelEmpty() ?
            this.serverFacade.getSameAs().getUri() :
            this.serverFacade.getLabel();
        EdgeHtmlBuilderCommon.buildLabel(
            this.html,
            label,
            SuggestionRelationUi.getWhenEmptyLabel()
        ).css("visibility", "visible");
        var edge = this.edge = SuggestionRelationUi.createFromHtmlAndUri(
            this.html,
            this.serverFacade.getUri()
        );
        edge.setOriginalServerObject(this.serverFacade);
        this._buildMenu();
        edge.hideMenu();
        return edge;
    };
    Self.prototype._buildMenu = function () {
        var menu = $("<span class='relation-menu menu'>");
        this.html.find(".label-container").append(menu);
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            this.edge.getMenuHandler().forSingle()
        );
    };
    return api;
});