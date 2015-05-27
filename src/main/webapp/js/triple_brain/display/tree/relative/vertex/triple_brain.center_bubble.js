/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(["jquery"],
    function () {
        var api = {};
        api.usingBubble = function (bubble) {
            return new Self(
                bubble
            );
        };
        function Self(bubble) {
            this.bubble = bubble;
        }

        Self.prototype.hasChildToLeft = function () {
            return this._getTopMostChildToLeftContainer().length > 0;
        };
        Self.prototype.hasChildToRight = function () {
            return this._getTopMostChildToRightContainer().length > 0;
        };
        Self.prototype.getToTheLeftTopMostChild = function () {
            return this.bubble.getSelectorFromContainer(
                this._getTopMostChildToLeftContainer()
            );
        };
        Self.prototype.getToTheRightTopMostChild = function () {
            return this.bubble.getSelectorFromContainer(
                this._getTopMostChildToRightContainer()
            );
        };

        Self.prototype.getContainerItShouldNextAddTo = function () {
            return this.shouldAddLeft() ?
                this.getLeftContainer() :
                this.getRightContainer();
        };

        Self.prototype.shouldAddLeft = function () {
            return this._getNumberOfImmediateBubblesToLeft() <
                this._getNumberOfImmediateBubblesToRight();
        };

        Self.prototype._getNumberOfImmediateBubblesToLeft = function () {
            return this.getLeftContainer().children(
                ".vertex-tree-container"
            ).length;
        };

        Self.prototype._getNumberOfImmediateBubblesToRight = function () {
            return this.getRightContainer().children(
                ".vertex-tree-container"
            ).length
        };

        Self.prototype.getLeftContainer = function () {
            if (this._leftContainer === undefined) {
                this._leftContainer = this.bubble.getHtml().closest(
                    ".vertex-container"
                ).siblings(
                    ".vertices-children-container.left-oriented"
                );
            }
            return this._leftContainer;
        };

        Self.prototype.getRightContainer = function () {
            if (this._rightContainer === undefined) {
                this._rightContainer = this.bubble.getHtml().closest(
                    ".vertex-container"
                ).siblings(
                    ".vertices-children-container"
                ).filter(":not(.left-oriented)");
            }
            return this._rightContainer;
        };

        Self.prototype._getTopMostChildToRightContainer = function () {
            return this.getRightContainer().find(
                ">.vertex-tree-container:first >.vertex-container"
            );
        };
        Self.prototype._getTopMostChildToLeftContainer = function () {
            return this.getLeftContainer().find(
                ">.vertex-tree-container:first >.vertex-container"
            );
        };
        return api;
    }
);