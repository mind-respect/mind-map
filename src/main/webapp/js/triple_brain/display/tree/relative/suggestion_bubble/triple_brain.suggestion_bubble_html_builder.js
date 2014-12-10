/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.vertex_html_builder_common",
    "triple_brain.relative_tree_vertex",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.suggestion_bubble_menu_handler",
    "triple_brain.ui.graph",
    "triple_brain.identification"
], function (VertexHtmlCommon, RelativeTreeVertex, SuggestionBubbleUi, GraphElementMainMenu, SuggestionBubbleMenuHandler, GraphUi, Identification) {
    "use strict";
    var api = {};
    api.withServerFacade = function (serverFacade) {
        return new Self(serverFacade);
    };
    function Self(serverFacade) {
        this.serverFacade = serverFacade;
    }

    Self.prototype.create = function (htmlId) {
        if (undefined === htmlId) {
            htmlId = GraphUi.generateBubbleHtmlId();
        }
        this.html = $(
            "<div class='suggestion vertex graph-element relative bubble'>"
        ).data(
            "uri",
            this.serverFacade.getUri()
        ).attr('id', htmlId).data(
            "suggestionFacade", this.serverFacade
        );
        var suggestionUi = SuggestionBubbleUi.withHtml(
            this.html
        );
        suggestionUi.setSuggestions([]);
        suggestionUi.setIncludedVertices([]);
        suggestionUi.setIncludedEdges([]);
        this._setupIdentifications(suggestionUi);
        RelativeTreeVertex.initCache(
            suggestionUi
        );
        VertexHtmlCommon.initCache(
            suggestionUi
        );
        VertexHtmlCommon.setUpClickBehavior(
            this.html
        );
        VertexHtmlCommon.buildLabelHtml(
            suggestionUi,
            VertexHtmlCommon.buildInsideBubbleContainer(
                this.html
            ),
            SuggestionBubbleUi,
            this.serverFacade
        );
        suggestionUi.setText("");
        GraphElementMainMenu.addRelevantButtonsInMenu(
            this._addMenu(),
            SuggestionBubbleMenuHandler.forSingle()
        );
        suggestionUi.hideMenu();
        suggestionUi.getLabel().on("change", function () {
            suggestionUi.integrate()
        });
        this.html.append(
            $("<span class='arrow'>")
        );
        return suggestionUi;
    };
    Self.prototype._addMenu = function () {
        return $("<div class='menu'>").appendTo(
            this.html
        );
    };
    Self.prototype._setupIdentifications = function (suggestionUi) {
        suggestionUi.setTypes([]);
        suggestionUi.setSameAs([]);
        suggestionUi.setGenericIdentifications([]);
        if (this.serverFacade.hasType()) {
            suggestionUi.addType(this.serverFacade.getType());
        }
        suggestionUi.addType(
            Identification.withUriLabelAndDescription(
                this.serverFacade.getSameAs().getUri(),
                this.serverFacade.getLabel(),
                this.serverFacade.getSameAs().getComment()
            )
        );
    };
    return api;

});