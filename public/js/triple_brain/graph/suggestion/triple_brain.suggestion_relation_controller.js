/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_controller"
], function (GraphElementController) {
    "use strict";
    var api = {};
    api.Self = SuggestionRelationController;
    function SuggestionRelationController(suggestionsRelationUi) {
        this.suggestionsRelationUi = suggestionsRelationUi;
        GraphElementController.Self.prototype.init.call(
            this,
            this.suggestionsRelationUi
        );
    }

    SuggestionRelationController.prototype = new GraphElementController.Self();

    SuggestionRelationController.prototype.centerCanDo = function () {
        return false;
    };

    SuggestionRelationController.prototype.cutCanDo = function () {
        return false;
    };

    return api;
});