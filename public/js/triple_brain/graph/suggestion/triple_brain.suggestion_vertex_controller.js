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
        SuggestionService.accept(
            self.suggestionsUi
        ).then(function (xhr) {
            var newVertexUi = self.suggestionsUi.integrateUsingNewVertexAndEdgeUri(
                xhr.vertex_uri,
                xhr.edge_uri
            );
            deferred.resolve(
                newVertexUi
            );
        });
        return deferred.promise();
    };

    SuggestionVertexController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    SuggestionVertexController.prototype.addChild = function () {
        this.accept().then(function (newVertex) {
            newVertex.getController().addChild();
        });
    };
    api.Self = SuggestionVertexController;
    return api;
});