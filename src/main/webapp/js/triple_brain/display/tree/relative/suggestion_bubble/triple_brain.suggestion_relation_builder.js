/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.edge_html_builder_common",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.identification"
], function (EdgeHtmlBuilderCommon, SuggestionRelationUi, GraphElementMainMenu, Identification) {
    "use strict";
    var api = {};
    api.get = function (serverFacade, sourceVertex, destinationVertex) {
        return new Self(
            serverFacade,
            sourceVertex,
            destinationVertex
        );
    };

    function Self(serverFacade, sourceVertex, destinationVertex) {
        this.serverFacade = serverFacade;
        this.sourceVertex = sourceVertex;
        this.destinationVertex = destinationVertex;
    }

    Self.prototype.create = function () {
        this.html = $(
            "<span class='suggestion relation graph-element'>"
        ).data(
            "uri",
            this.serverFacade.getUri()
        ).uniqueId();
        var inBubbleContainer = this.destinationVertex.getInBubbleContainer(),
            isToTheLeft = this.destinationVertex.isToTheLeft();
        this.html[isToTheLeft ? "appendTo" : "prependTo"](
            inBubbleContainer
        ).css(
            isToTheLeft ? "margin-left" : "margin-right", "1em"
        ).append(this.html);
        var label = this.serverFacade.isLabelEmpty() ?
            this.serverFacade.getSameAs().getUri() :
            this.serverFacade.getLabel();
        EdgeHtmlBuilderCommon.buildLabel(
            this.html,
            label,
            SuggestionRelationUi.getWhenEmptyLabel()
        ).css("visibility", "visible");
        var edge = this.edge = SuggestionRelationUi.withHtml(this.html);
        this._buildMenu();
        edge.hideMenu();
        edge.setUri(this.serverFacade.getUri());
        edge.setTypes([]);
        edge.setSameAs([
            Identification.withUriLabelAndDescription(
                this.serverFacade.getSameAs().getUri(),
                this.serverFacade.getLabel(),
                this.serverFacade.getSameAs().getComment()
            )
        ]);
        edge.setGenericIdentifications([]);
        return edge;
    };
    Self.prototype._buildMenu = function () {
        var menu = $("<span class='relation-menu'>");
        this.html.append(menu);
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            this.edge.getMenuHandler().forSingle()
        );
    };
    return api;
});