/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.usingModalHtml = function(modalHtml){
        return new AskModal(modalHtml);
    };
    function AskModal(modal){
        this.modal = modal;
        this.modal.on('shown.bs.modal', function() {
            $(this).find(
                ".confirm"
            ).attr('tabindex',-1).focus();
        });
        this.deferred = $.Deferred();
        this.setupFooter();
        this.setupConfirmButton();
        this.setupClose();
        this.modal.i18n();
    }
    AskModal.prototype.ask = function(){
        this.modal.modal();
        return this.deferred.promise();
    };
    AskModal.prototype.setupConfirmButton = function () {
        var confirmButton = $(
            "<button type='button' class='confirm btn btn-danger' tabindex='-1'>"
            ).append(
                $("<i class='fa fa-trash-o'>"),
                " ",
                $("<span data-i18n='vertex.menu.delete.button.confirm'>"),
                " ",
                $("<span class='multiple-flow hidden' data-i18n='vertex.menu.delete.button.multiple_confirm_suffix'>")
            ).appendTo(this.footer);
        confirmButton.one(
            "click",
            function (event) {
                event.stopPropagation();
                this.deferred.resolve(
                    this.graphElements
                );
                this.modal.modal("hide");
            }.bind(this)
        );
    };

    AskModal.prototype.setupClose = function () {
        var closeButton = $("" +
            "<button type='button' class='cancel btn btn-success' data-i18n='vertex.menu.delete.button.cancel'>"
        ).appendTo(this.footer);
        closeButton.on('hidden.bs.modal', function () {
            if(!this.deferred.state()){
                this.deferred.reject(
                    this.graphElements
                );
            }
        }.bind(this));
    };

    AskModal.prototype.setupFooter = function(){
        this.footer = $(
            "<div class='col-lg-12 text-center'>"
        ).appendTo(this.modal.find(".modal-footer").empty());
    };
    return api;
});