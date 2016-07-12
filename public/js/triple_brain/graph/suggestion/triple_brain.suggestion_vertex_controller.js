/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "triple_brain.suggestion_service"
], function ($, GraphElementController, SuggestionService) {
    "use strict";
    var api = {};

    function SuggestionVertexController(suggestionsUi) {
        this.suggestionsUi = suggestionsUi;
        GraphElementController.Self.prototype.init.call(
            this,
            this.suggestionsUi
        );
    }

    SuggestionVertexController.prototype = new GraphElementController.Self();

    SuggestionVertexController.prototype.acceptCanDo = function () {
        return this.isSingleAndOwned();
    };

    SuggestionVertexController.prototype.accept = function () {
        var deferred = $.Deferred();
        var self = this;
        var suggestionVertex = this.getElements();
        var parentSuggestionVertex = suggestionVertex.getParentSuggestionVertex();
        var hasParentSuggestionVertex = !parentSuggestionVertex.isSameBubble(
            suggestionVertex
        );
        if (hasParentSuggestionVertex) {
            return parentSuggestionVertex.getController().accept().then(
                acceptCurrent
            );
        }
        return acceptCurrent();
        function acceptCurrent() {
            return SuggestionService.accept(
                self.getElements()
            ).then(function (xhr) {
                var newVertexUi = self.getElements().integrateUsingNewVertexAndEdgeUri(
                    xhr.vertex_uri,
                    xhr.edge_uri
                );
                return deferred.resolve(
                    newVertexUi
                );
            });
        }
    };

    SuggestionVertexController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    SuggestionVertexController.prototype.addChild = function () {
        this.accept().then(function (newVertex) {
            newVertex.getController().addChild();
        });
    };
    SuggestionVertexController.prototype.centerCanDo = function () {
        return false;
    };
    api.Self = SuggestionVertexController;
    return api;
});