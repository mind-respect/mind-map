/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.graph_element_html_builder",
    "triple_brain.relative_tree_vertex",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.suggestion_bubble_menu_handler",
    "triple_brain.graph_ui",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, VertexHtmlCommon, GraphElementHtmlBuilder, RelativeTreeVertex, SuggestionBubbleUi, GraphElementMainMenu, SuggestionBubbleMenuHandler, GraphUi, Identification, EventBus) {
    "use strict";
    var api = {};
    api.withServerFacade = function (serverFacade) {
        return new Self(serverFacade);
    };
    api.completeBuild = function(suggestionUi){
        setupIdentifications(
            suggestionUi
        );
    };
    function Self(model) {
        this.serverFacade = model;
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
        ).attr('id', htmlId);
        var suggestionUi = SuggestionBubbleUi.createFromHtml(
            this.html
        );
        suggestionUi.setModel(
            this.serverFacade
        );
        suggestionUi.setSuggestions([]);
        suggestionUi.setIncludedVertices([]);
        suggestionUi.setIncludedEdges([]);
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
            suggestionUi.integrate();
        });
        this.html.append(
            $("<span class='arrow'>")
        );
        EventBus.publish("suggestion_ui_shown", suggestionUi);
        return suggestionUi;
    };
    Self.prototype._addMenu = function () {
        return $("<div class='menu'>").appendTo(
            this.html
        );
    };
    function setupIdentifications(suggestionUi){
        suggestionUi.setTypes([]);
        suggestionUi.setSameAs([]);
        suggestionUi.setGenericIdentifications([]);
        var serverFormat = suggestionUi.getSuggestion();
        if (serverFormat.hasType()) {
            suggestionUi.addType(serverFormat.getType());
        }
        suggestionUi.addType(
            Identification.withUriLabelAndDescription(
                serverFormat.getSameAs().getUri(),
                serverFormat.getLabel(),
                serverFormat.getSameAs().getComment()
            )
        );
    }
    return api;
});