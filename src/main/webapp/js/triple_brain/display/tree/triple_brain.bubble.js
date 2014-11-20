/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.event_bus",
        "triple_brain.ui.utils",
        "triple_brain.image_displayer",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble_factory",
        "triple_brain.selection_handler"
    ], function (EventBus, UiUtils, ImageDisplayer, GraphElementUi, BubbleFactory, SelectionHandler) {
        "use strict";
        var api = {};

        api.withHtml = function (html) {
            return new api.Self(html);
        };

        api.Self = function (html) {
            this.html = html;
        };

        api.Self.prototype = new GraphElementUi.Self;

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
            if (parentBubble.isVertex()) {
                return parentBubble;
            }
            return parentBubble.getParentBubble();
        };
        api.Self.prototype.getChildrenContainer = function () {
            return this.html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            )
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

        api.Self.prototype.getChildrenBubblesHtml = function () {
            return this.getChildrenContainer().find(
                "> .vertex-tree-container > .vertex-container > .bubble"
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
            do{
                parentBubble = parentBubble.getParentBubble();
                if(parentBubble.isCenterBubble()){
                    return this;
                }
                surroundBubbleHtml = htmlGetter(
                    parentBubble.getHtml()
                );
                if (surroundBubbleHtml.length !== 0) {
                    found = true;
                }else{
                    distance++;
                }
            }while(!found);
            surroundBubble = BubbleFactory.fromHtml(
                surroundBubbleHtml
            );
            while(distance !== 0){
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
            return this.getChildrenBubblesHtml().length > 0;
        };
        api.Self.prototype.getSelectorFromContainer = function (container) {
            return BubbleFactory.fromHtml(
                container.find("> .bubble")
            );
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
            if(this.isVertex()){
                SelectionHandler.removeVertex(this);
            }else{
                SelectionHandler.removeRelation(this);
            }
            this.removeHiddenRelationsContainer();
            if (this.isCenterBubble()) {
                this.html.closest(".vertex-container").remove();
            } else {
                var treeContainer = this.html.closest(".vertex-tree-container"),
                    clearFix = treeContainer.next(".clear-fix");
                clearFix.remove();
                treeContainer.remove();
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
            this.addImages(
                identification.getImages()
            );
        };

        api.Self.prototype.isToTheLeft = function () {
            if (this._isToTheLeft === undefined) {
                this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
            }
            return this._isToTheLeft;
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
