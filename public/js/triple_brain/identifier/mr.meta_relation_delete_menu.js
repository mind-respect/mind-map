/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.ask_modal"
], function ($, AskModal) {
    "use strict";
    var api = {};
    api.ofMetaRelation = function (metaRelation) {
        return new MetaRelationDeleteMenu(
            metaRelation
        );
    };
    function MetaRelationDeleteMenu(metaRelation){
        this.modal = $("#remove-meta-relation-confirm-menu");
        this.askModal = AskModal.usingModalHtml(this.modal);
        this.modal.find(".bubble-label").text(
            metaRelation.getSourceVertex().text()
        );
        this.modal.find(".meta-label").text(
            metaRelation.getDestinationVertex().text()
        );
    }

    MetaRelationDeleteMenu.prototype.ask = function(){
        return this.askModal.ask();
    };

    return api;
});