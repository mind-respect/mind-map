/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.vertex-ui-builder-common",
    "mr.graph-element-ui-builder",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_ui",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, VertexUiBuilderCommon, GraphElementUiBuilder, SuggestionBubbleUi, GraphElementMainMenu, GraphUi, Identification, EventBus) {
    "use strict";
    var api = {};
    api.completeBuild = function (suggestionUi) {
        setupIdentifications(
            suggestionUi
        );

    };
    api.SuggestionUiBuilder = function() {};

    api.SuggestionUiBuilder.prototype.create = function (suggestion, htmlId) {
        this.suggestion = suggestion;
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
        VertexUiBuilderCommon.setUpClickBehavior(
            this.html
        );
        VertexUiBuilderCommon.buildLabelHtml(
            suggestionUi,
            VertexUiBuilderCommon.buildInsideBubbleContainer(
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

    api.SuggestionUiBuilder.prototype._addMenu = function () {
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