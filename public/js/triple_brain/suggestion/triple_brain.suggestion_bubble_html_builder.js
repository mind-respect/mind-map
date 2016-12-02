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
    "triple_brain.suggestion_vertex_controller",
    "triple_brain.graph_ui",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, VertexHtmlCommon, GraphElementHtmlBuilder, RelativeTreeVertex, SuggestionBubbleUi, GraphElementMainMenu, SuggestionVertexController, GraphUi, Identification, EventBus) {
    "use strict";
    var api = {};
    api.withServerFacade = function (suggestion) {
        return new Self(suggestion);
    };
    api.completeBuild = function (suggestionUi) {
        setupIdentifications(
            suggestionUi
        );

    };
    function Self(model) {
        this.suggestion = model;
    }

    Self.prototype.create = function (htmlId) {
        if (undefined === htmlId) {
            htmlId = GraphUi.generateBubbleHtmlId();
        }
        this.html = $(
            "<div class='suggestion vertex graph-element relative bubble'>"
        ).data(
            "uri",
            this.suggestion.getUri()
        ).attr('id', htmlId);
        var suggestionUi = SuggestionBubbleUi.createFromHtml(
            this.html
        );
        suggestionUi.setModel(
            this.suggestion
        );
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
            this.suggestion
        );
        suggestionUi.setText("");
        GraphElementMainMenu.addRelevantButtonsInMenu(
            this._addMenu(),
            suggestionUi.getController()
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
    function setupIdentifications(suggestionUi) {
        var model = suggestionUi.getSuggestion();
        if (model.hasType()) {
            suggestionUi.addIdentification(
                model.getType()
            );
        }
        suggestionUi.addIdentification(
            Identification.withUriLabelAndDescription(
                model.getSameAs().getUri(),
                model.getLabel(),
                model.getSameAs().getComment()
            )
        );
    }

    return api;
});