/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.ui.utils",
        "triple_brain.image_displayer",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble_factory",
        "triple_brain.selection_handler",
        "triple_brain.center_bubble"
    ], function ($, EventBus, UiUtils, ImageDisplayer, GraphElementUi, BubbleFactory, SelectionHandler, CenterBubble) {
        "use strict";
        var api = {};

        api.withHtml = function (html) {
            return new api.Self(html);
        };

        api.Self = function (html) {
            this.html = html;
        };

        api.Self.prototype = new GraphElementUi.Self();

        api.Self.prototype.moveToParent = function (parent) {
            if (this.isVertex()) {
                return this.getParentBubble().moveToParent(
                    parent
                );
            }
            var isOriginalToTheLeft = this.isToTheLeft();
            var treeContainer = this.html.closest(".vertex-tree-container");
            var toMove = treeContainer.add(treeContainer.next(".clear-fix"));
            if (parent.isGroupRelation()) {
                if (!parent.isExpanded()) {
                    parent.addChildTree();
                }
                var identification = parent.getGroupRelation().getIdentification();
                if (this.hasIdentification(identification)) {
                    this.revertIdentificationIntegration(identification);
                }
            }
            var newContainer = parent.isCenterBubble() ?
                CenterBubble.usingBubble(parent).getContainerItShouldNextAddTo() :
                parent.getHtml().closest(".vertex-container").siblings(".vertices-children-container");
            newContainer.append(
                toMove
            );
            this._resetIsToTheLeft();
            SelectionHandler.setToSingleGraphElement(this);
            if(this.isRelation()){
                this.reviewEditButtonDisplay();
            }
            if (isOriginalToTheLeft === this.isToTheLeft()) {
                return;
            }
            var treeContainers = treeContainer.add(
                treeContainer.find("> .vertices-children-container").find(".vertex-tree-container")
            );
            if (this.isToTheLeft()) {
                this.convertToLeft();
                $.each(treeContainers, convertTreeStructureToLeft);
            } else {
                this.getDestinationVertex().convertToRight();
                this.convertToRight();
                $.each(treeContainers, convertTreeStructureToRight);
            }
        };
        function convertTreeStructureToLeft() {
            var treeContainer = $(this);
            treeContainer.find("> .vertex-container").prependTo(treeContainer);
            treeContainer.find("> .vertices-children-container").prependTo(treeContainer);
        }

        function convertTreeStructureToRight() {
            var treeContainer = $(this);
            treeContainer.find("> .vertex-container").appendTo(treeContainer);
            treeContainer.find("> .vertices-children-container").appendTo(treeContainer);
        }

        api.Self.prototype.convertToLeft = function () {
            this._resetIsToTheLeft();
            this.getOriginalServerObject().leftOriented = true;
            this.getInLabelButtonsContainer().insertAfter(
                this.getLabel()
            );
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().convertToLeft();
            }
            this.visitAllChild(function(child){
                child.convertToLeft();
            });
        };

        api.Self.prototype.convertToRight = function () {
            this._resetIsToTheLeft();
            this.getOriginalServerObject().leftOriented = false;
            this.getInLabelButtonsContainer().insertBefore(
                this.getLabel()
            );
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().convertToRight();
            }
            this.visitAllChild(function(child){
                child.convertToRight();
            });
        };

        api.Self.prototype.getParentBubble = function () {
            if (this.isCenterBubble()) {
                return this;
            }
            return BubbleFactory.fromHtml(
                this.html.closest(".vertices-children-container")
                    .siblings(".vertex-container").find("> .bubble")
            );
        };
        api.Self.prototype.getParentVertex = function () {
            var parentBubble = this.getParentBubble();
            if (this.isSameBubble(parentBubble)) {
                return this;
            }
            if (parentBubble.isVertex()) {
                return parentBubble;
            }
            return parentBubble.getParentVertex();
        };
        api.Self.prototype.getChildrenContainer = function () {
            return this.html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            );
        };

        api.Self.prototype.isBubbleAChild = function (bubble) {
            return this.getChildrenContainer().find(
                    "#" + bubble.getId()
                ).length > 0;
        };

        api.Self.prototype.getTopMostChildBubble = function () {
            var topMostBubbleHtml = this.getChildrenBubblesHtml().filter(
                ":first"
            );
            if (topMostBubbleHtml.length === 0) {
                return this;
            }
            return BubbleFactory.fromHtml(
                topMostBubbleHtml
            );
        };

        api.Self.prototype.visitAllChild = function (visitor) {
            $.each(this.getChildrenBubblesHtml(), function () {
                return visitor(BubbleFactory.fromHtml(
                    $(this)
                ));
            });
        };

        api.Self.prototype.getChildrenBubblesHtml = function () {
            return this.getChildrenContainer().find(
                "> .vertex-tree-container > .vertex-container > .bubble"
            );
        };

        api.Self.prototype.getInBubbleContainer = function () {
            return this.html.find(
                ".in-bubble-content"
            );
        };

        api.Self.prototype.getBubbleAbove = function () {
            return this._getColumnBubble(
                api._getBubbleHtmlAbove
            );
        };

        api.Self.prototype.getBubbleUnder = function () {
            return this._getColumnBubble(
                api._getBubbleHtmlUnder
            );
        };

        api.Self.prototype._getColumnBubble = function (surroundHtmlGetter) {
            var surroundBubbleHtml = surroundHtmlGetter(
                this.html
            );
            if (surroundBubbleHtml.length === 0) {
                return this._getColumnBubbleInAnotherBranch(surroundHtmlGetter);
            }
            return BubbleFactory.fromHtml(surroundBubbleHtml);
        };

        api.Self.prototype._getColumnBubbleInAnotherBranch = function (htmlGetter) {
            var distance = 1,
                parentBubble = this,
                surroundBubble,
                found = false,
                surroundBubbleHtml;
            do {
                parentBubble = parentBubble.getParentBubble();
                if (parentBubble.isCenterBubble()) {
                    return this;
                }
                surroundBubbleHtml = htmlGetter(
                    parentBubble.getHtml()
                );
                if (surroundBubbleHtml.length !== 0) {
                    found = true;
                } else {
                    distance++;
                }
            } while (!found);
            surroundBubble = BubbleFactory.fromHtml(
                surroundBubbleHtml
            );
            while (distance !== 0) {
                surroundBubble = surroundBubble.getTopMostChildBubble();
                distance--;
            }
            return surroundBubble;
        };

        api.Self.prototype.getBubbleUnder = function () {
            return this._getColumnBubble(
                api._getBubbleHtmlUnder
            );
        };
        api._getBubbleHtmlUnder = function (html) {
            return html.closest(
                ".vertex-tree-container"
            ).nextAll(
                ".vertex-tree-container:first"
            ).find("> .vertex-container >.bubble");
        };

        api._getBubbleHtmlAbove = function (html) {
            return html.closest(
                ".vertex-tree-container"
            ).prevAll(
                ".vertex-tree-container:first"
            ).
                find("> .vertex-container >.bubble");
        };

        api.Self.prototype.hasChildren = function () {
            return this.getNumberOfChild() > 0;
        };
        api.Self.prototype.getNumberOfChild = function () {
            return this.getChildrenBubblesHtml().length;
        };
        api.Self.prototype.getSelectorFromContainer = function (container) {
            return BubbleFactory.fromHtml(
                container.find("> .bubble")
            );
        };

        api.Self.prototype.isExpanded = function () {
            return !this.hasHiddenRelationsContainer();
        };

        api.Self.prototype.hasHiddenRelationsContainer = function () {
            return undefined !== this.getHiddenRelationsContainer();
        };

        api.Self.prototype.setHiddenRelationsContainer = function (hiddenRelationsContainer) {
            this.html.data(
                "hidden_properties_indicator",
                hiddenRelationsContainer
            );
        };

        api.Self.prototype.getHiddenRelationsContainer = function () {
            return this.html.data(
                "hidden_properties_indicator"
            );
        };

        api.Self.prototype.remove = function () {
            this._removeHideOrShow("remove");
            this.removeHiddenRelationsContainer();
        };

        api.Self.prototype.show = function () {
            this.showHiddenRelationsContainer();
            this._removeHideOrShow("removeClass", "hidden");
        };

        api.Self.prototype.hide = function () {
            this.hideHiddenRelationsContainer();
            this._removeHideOrShow("addClass", "hidden");
        };

        api.Self.prototype.isVisible = function () {
            return !this.html.closest(
                    ".vertex-container"
                ).hasClass("hidden") && !this.html.closest(".vertex-tree-container").hasClass("hidden");
        };

        api.Self.prototype._removeHideOrShow = function (action, argument) {
            SelectionHandler.removeAll();
            if (this.isCenterBubble()) {
                this.html.closest(".vertex-container")[action](argument);
            } else {
                var treeContainer = this.html.closest(".vertex-tree-container"),
                    clearFix = treeContainer.next(".clear-fix");
                clearFix[action](argument);
                treeContainer[action](argument);
            }
        };

        api.Self.prototype.showHiddenRelationsContainer = function () {
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().show();
            }
        };

        api.Self.prototype.hideHiddenRelationsContainer = function () {
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().hide();
            }
        };

        api.Self.prototype.removeHiddenRelationsContainer = function () {
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().remove();
            }
            this.html.removeData(
                "hidden_properties_indicator"
            );
        };

        api.Self.prototype.refreshImages = function () {
            var imageMenu =
                this.hasImagesMenu() ?
                    this.getImageMenu() :
                    this.createImageMenu();
            imageMenu.refreshImages();
        };
        api.Self.prototype.addImages = function (images) {
            var existingImages = this.getImages();
            this.html.data(
                "images",
                existingImages.concat(
                    images
                )
            );
        };
        api.Self.prototype.removeImage = function (imageToRemove) {
            var images = [];
            $.each(this.getImages(), function () {
                var image = this;
                if (image.getBase64ForSmall() !== imageToRemove.getBase64ForSmall()) {
                    images.push(image);
                }
            });
            this.html.data(
                "images",
                images
            );
        };
        api.Self.prototype.hasImages = function () {
            return this.getImages().length > 0;
        };
        api.Self.prototype.getImages = function () {
            return this.html.data("images") === undefined ?
                [] :
                this.html.data("images");
        };

        api.Self.prototype.hasImagesMenu = function () {
            return this.html.data("images_menu") !== undefined;
        };

        api.Self.prototype.createImageMenu = function () {
            var imageMenu = ImageDisplayer.ofBubble(
                this
            ).create();
            this.html.data("images_menu", imageMenu);
            return imageMenu;
        };

        api.Self.prototype.getImageMenu = function () {
            return this.html.data("images_menu");
        };

        api.Self.prototype.impactOnRemovedIdentification = function (identification) {
            var self = this;
            $.each(identification.getImages(), function () {
                var image = this;
                self.removeImage(image);
            });
            if (this.hasImagesMenu()) {
                this.getImageMenu().refreshImages();
            }
        };

        api.Self.prototype.integrateIdentification = function (identification) {
            var parentBubble = this.getParentBubble();
            if (parentBubble.isGroupRelation()) {
                var areIdentificationsTheSame =
                    identification.getExternalResourceUri() ===
                    parentBubble.getGroupRelation().getIdentification().getExternalResourceUri();
                if (areIdentificationsTheSame) {
                    return;
                }
            }
            this.addImages(
                identification.getImages()
            );
            if (identification.hasImages()) {
                this.refreshImages();
            }
        };

        api.Self.prototype.revertIdentificationIntegration = function (identification) {
            var self = this;
            $.each(identification.getImages(), function () {
                self.removeImage(this);
            });
            if (identification.hasImages()) {
                this.refreshImages();
            }
        };

        api.Self.prototype._resetIsToTheLeft = function () {
            this._isToTheLeft = undefined;
            this.getOriginalServerObject().isLeftOriented = this.isToTheLeft();
        };

        api.Self.prototype.isToTheLeft = function () {
            if (this._isToTheLeft === undefined) {
                this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
            }
            return this._isToTheLeft;
        };

        api.Self.prototype.isSameBubble = function (bubble) {
            return this.getId() === bubble.getId();
        };

        api.Self.prototype.isSelected = function () {
            return this.html.hasClass("selected");
        };

        api.Self.prototype.setText = function (text) {
            this.getLabel().html(text);
        };

        api.Self.prototype.getArrowHtml = function () {
            return this.html.find(".arrow");
        };

        api.Self.prototype.centerOnScreenWithAnimation = function () {
            this.getHtml().centerOnScreenWithAnimation();
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function (event, triple, sourceBubble) {
                sourceBubble.removeHiddenRelationsContainer();
                var destinationHtml = triple.destinationVertex().getHtml();
                if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                    destinationHtml.centerOnScreenWithAnimation();
                }
            }
        );
        return api;
    }
);
