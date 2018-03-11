/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function () {
        "use strict";
        var api = {};
        api.usingBubble = function (bubble) {
            return new CenterBubble(
                bubble
            );
        };
        function CenterBubble(bubble) {
            this.bubble = bubble;
        }

        CenterBubble.prototype.hasChildToLeft = function () {
            return this._getTopMostChildToLeftContainer().length > 0;
        };
        CenterBubble.prototype.hasChildToRight = function () {
            return this._getTopMostChildToRightContainer().length > 0;
        };
        CenterBubble.prototype.getToTheLeftTopMostChild = function () {
            return this.bubble.getSelectorFromContainer(
                this._getTopMostChildToLeftContainer()
            );
        };
        CenterBubble.prototype.getToTheRightTopMostChild = function () {
            return this.bubble.getSelectorFromContainer(
                this._getTopMostChildToRightContainer()
            );
        };

        CenterBubble.prototype.getContainerItShouldNextAddTo = function () {
            return this.shouldAddLeft() ?
                this.getLeftContainer() :
                this.getRightContainer();
        };

        CenterBubble.prototype.shouldAddLeft = function () {
            return this._getNumberOfImmediateBubblesToLeft() <
                this._getNumberOfImmediateBubblesToRight();
        };

        CenterBubble.prototype._getNumberOfImmediateBubblesToLeft = function () {
            return this.getLeftContainer().children(
                ".vertex-tree-container"
            ).length;
        };

        CenterBubble.prototype._getNumberOfImmediateBubblesToRight = function () {
            return this.getRightContainer().children(
                ".vertex-tree-container"
            ).length;
        };

        CenterBubble.prototype.getLeftContainer = function () {
            if (this._leftContainer === undefined) {
                this._leftContainer = this.bubble.getHtml().closest(
                    ".vertex-container"
                ).siblings(
                    ".vertices-children-container.left-oriented"
                );
            }
            return this._leftContainer;
        };

        CenterBubble.prototype.getRightContainer = function () {
            if (this._rightContainer === undefined) {
                this._rightContainer = this.bubble.getHtml().closest(
                    ".vertex-container"
                ).siblings(
                    ".vertices-children-container"
                ).filter(":not(.left-oriented)");
            }
            return this._rightContainer;
        };

        CenterBubble.prototype._getTopMostChildToRightContainer = function () {
            return this.getRightContainer().find(
                ">.vertex-tree-container:first >.vertex-container"
            );
        };
        CenterBubble.prototype._getTopMostChildToLeftContainer = function () {
            return this.getLeftContainer().find(
                ">.vertex-tree-container:first >.vertex-container"
            );
        };
        return api;
    }
);
