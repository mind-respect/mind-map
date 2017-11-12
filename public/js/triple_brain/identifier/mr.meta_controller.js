/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller"
], function ($, GraphElementController) {
    "use strict";
    var api = {};

    function MetaController(metas) {
        this.metas = metas;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.metas
        );
    }

    MetaController.prototype = new GraphElementController.GraphElementController();

    MetaController.prototype.identifyCanDo = function () {
        return false;
    };

    MetaController.prototype.identifyCanShowInLabel = function () {
        return $.Deferred().resolve(
            false
        );
    };

    MetaController.prototype.identifyWhenManyCanShowInLabel = function () {
        return $.Deferred().resolve(
            false
        );
    };

    MetaController.prototype.wikipediaLinksCanShowInLabel = function () {
        return this.getModel().getWikipediaLink().then(function(hasLink){
            return hasLink;
        });
    };

    api.MetaController = MetaController;
    return api;
});