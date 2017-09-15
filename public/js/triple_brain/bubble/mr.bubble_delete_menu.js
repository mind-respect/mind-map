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
        api.forRelation = function (relation) {
            return new DeleteMenu(
                relation
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
            this.modal.find(".vertex-only")[
                this._areAllElementsVertices() ?
                "removeClass" :
                "addClass"
                ]("hidden");
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

        DeleteMenu.prototype._areAllElementsVertices = function(){
            var areAllVertices = true;
            var elements = this.isMultipleBubblesFlow ? this.graphElements : [this.graphElements];
            elements.forEach(function (graphElement) {
                if(!graphElement.isVertex()){
                    areAllVertices = false;
                }
            });
            return areAllVertices;
        };

        return api;
    }
);