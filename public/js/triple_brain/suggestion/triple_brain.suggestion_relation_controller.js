/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_controller"
], function (GraphElementController) {
    "use strict";
    var api = {};
    api.RelationSuggestionController = SuggestionRelationController;
    function SuggestionRelationController(suggestionsRelationUi) {
        this.suggestionsRelationUi = suggestionsRelationUi;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.suggestionsRelationUi
        );
    }

    SuggestionRelationController.prototype = new GraphElementController.GraphElementController();

    SuggestionRelationController.prototype.centerCanDo = function () {
        return false;
    };

    SuggestionRelationController.prototype.cutCanDo = function () {
        return false;
    };

    SuggestionRelationController.prototype.addSiblingCanDo = function () {
        return false;
    };

    return api;
});