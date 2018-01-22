/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "mr.meta_service",
    "triple_brain.graph_displayer"
], function ($, GraphElementController, MetaService, GraphDisplayer) {
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
        return this.getModel().getWikipediaLink().then(function (hasLink) {
            return hasLink;
        });
    };


    MetaController.prototype.convertToDistantBubbleWithUriCanDo = function () {
        return true;
    };

    MetaController.prototype.convertToDistantBubbleWithUri = function (distantTagUri) {
        if (!this.convertToDistantBubbleWithUriCanDo(distantTagUri)) {
            return $.Deferred().reject();
        }
        this.getUi().beforeConvertToDistantBubbleWithUri();
        return MetaService.mergeTo(this.getModel(), distantTagUri).then(function () {
            this.getUi().mergeTo(distantTagUri);
            return GraphDisplayer.displayForMetaWithUri(
                distantTagUri
            );
        }.bind(this));
    };

    MetaController.prototype.mergeCanDo = function () {
        return true;
    };

    api.MetaController = MetaController;
    return api;
});