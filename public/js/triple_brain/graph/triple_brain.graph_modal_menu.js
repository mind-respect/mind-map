/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_ui",
    "bootstrap"
], function ($, GraphUi) {
    "use strict";
    var api = {};
    api.forModalId = function(modalId){
        return new GraphModalMenu(
            $("#"+modalId)
        );
    };
    function GraphModalMenu(modal) {
        this.modal = modal;
    }

    GraphModalMenu.prototype.show = function () {
        this.modal.modal({
            backdrop: 'static',
            keyboard: false
        }).on('shown.bs.modal', function(){
            GraphUi.disableDragScroll();
            GraphUi.lockDragScroll();
            $(this).find("[data-autofocus=true]:first").focus();
        }).on('hidden.bs.modal', function(){
            GraphUi.unlockDragScroll();
            GraphUi.enableDragScroll();
        });
        return this;
    };

    GraphModalMenu.prototype.hide = function () {
        this.modal.modal("hide");
    };
    return api;
});