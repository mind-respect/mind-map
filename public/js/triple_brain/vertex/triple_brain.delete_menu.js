/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function ($) {
        "use strict";
        var api = {};
        api.ofVertexAndDeletionBehavior = function (vertex, deleteCallback) {
            return new DeleteMenu(
                vertex,
                deleteCallback
            );
        };
        return api;
        function DeleteMenu(vertex, deleteCallback) {
            this.build = function () {
                this.vertex = vertex;
                this.modal = $("#remove-confirm-menu");
                this.modal.modal().on('shown.bs.modal', function() {
                    $(this).find(
                        ".confirm"
                    ).attr('tabindex',-1).focus();
                });
                this.isMultipleBubblesFlow = Array.isArray(vertex);
                this.modal.find(".multiple-flow")[
                    this.isMultipleBubblesFlow ?
                        "removeClass" :
                        "addClass"
                    ]("hidden");
                this.displayLabelOfSelectedBubbles();
                this.setupConfirmButton();
                this.setupCancelButton();
                return this;
            };

            this.displayLabelOfSelectedBubbles = function () {
                var ul = this.modal.find(".selected-bubbles").empty();
                var titleBubbleLabelContainer = this.modal.find(
                    ".modal-title .bubble-label"
                ).empty();
                if (!this.isMultipleBubblesFlow) {
                    titleBubbleLabelContainer.text(
                        vertex.text()
                    );
                    return;
                }
                this.vertex.forEach(function (vertex) {
                    ul.append(
                        $("<li>").text(
                            vertex.getTextOrDefault()
                        )
                    );
                });
            };

            this.setupConfirmButton = function () {
                this.modal.find(".confirm").one(
                    "click",
                    function (event) {
                        event.stopPropagation();
                        deleteCallback(
                            this.vertex
                        );
                        this.modal.modal("hide");
                    }.bind(this)
                );
            };

            this.setupCancelButton = function () {
                this.modal.find(".cancel").on(
                    "click",
                    function (event) {
                        event.stopPropagation();
                        this.modal.modal("hide");
                    }.bind(this)
                );
            };
        }
    }
);