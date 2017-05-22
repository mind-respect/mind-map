/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "mr.ask_modal"
    ],
    function ($, AskModal) {
        "use strict";
        var api = {};
        api.forVertices = function (vertices) {
            return new DeleteMenu(
                vertices
            );
        };
        function DeleteMenu(graphElements) {
            this.graphElements = graphElements;
            this.modal = $("#remove-confirm-menu");
            this.askModal = AskModal.usingModalHtml(this.modal);
            this.isMultipleBubblesFlow = Array.isArray(this.graphElements);
            this.ul = this.modal.find(".selected-bubbles").empty();
            this.titleBubbleLabelContainer = this.modal.find(
                ".modal-title .bubble-label"
            ).empty();
            this.modal.find(".multiple-flow")[
                this.isMultipleBubblesFlow ?
                    "removeClass" :
                    "addClass"
                ]("hidden");
            this.displayLabelOfSelectedBubbles();
        }

        DeleteMenu.prototype.ask = function(){
            return this.askModal.ask();
        };

        DeleteMenu.prototype.displayLabelOfSelectedBubbles = function(){
            if (!this.isMultipleBubblesFlow) {
                this.titleBubbleLabelContainer.text(
                    this.graphElements.text()
                );
                return;
            }
            this.graphElements.forEach(function (graphElement) {
                this.ul.append(
                    $("<li>").text(
                        graphElement.getTextOrDefault()
                    )
                );
            }.bind(this));
        };

        return api;
    }
);