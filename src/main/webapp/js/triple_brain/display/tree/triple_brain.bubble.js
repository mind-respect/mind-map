/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.graph_displayer",
        "triple_brain.event_bus",
        "triple_brain.ui.utils",
        "triple_brain.mind_map_info",
        "triple_brain.image_displayer"
    ], function (GraphDisplayer, EventBus, UiUtils, MindMapInfo, ImageDisplayer) {
        "use strict";
        var api = {};
        api.withHtmlFacade = function (htmlFacade) {
            return new Self(htmlFacade);
        };
        function Self(htmlFacade) {
            this.html = htmlFacade.getHtml();
            this.htmlFacade = htmlFacade;
        }

        Self.prototype.getParentBubble = function () {
            return this.getSelectorFromContainer(
                this._getParentBubbleContainer()
            );
        };
        Self.prototype.getParentVertex = function () {
            var parentContainer = this._getParentBubbleContainer(),
                parentVertexHtml = parentContainer.find(
                    "> .vertex"
                );
            return parentVertexHtml.length === 0 ?
                getRelationFromParentContainer(
                    parentContainer
                ).getParentVertex() :
                getVertexSelector().withHtml(
                    parentVertexHtml
                );
        };
        Self.prototype.getChildrenContainer = function () {
            return this.html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            )
        };

        Self.prototype.getTopMostChild = function () {
            var topMostChildHtml = $(this.getChildrenBubblesHtml()[0]);
            if(topMostChildHtml.hasClass("group-relation")){
                return GraphDisplayer.getGroupRelationSelector().withHtml(
                    topMostChildHtml
                );
            }else if(topMostChildHtml.hasClass("property")){
                return GraphDisplayer.getPropertySelector().withHtml(
                    topMostChildHtml
                );
            }else{
                return getVertexSelector().withHtml(topMostChildHtml);
            }
        };

        Self.prototype.getChildrenBubblesHtml = function () {
            return this.getChildrenContainer().find(
                ".group-relation, .vertex, .property"
            );
        };

        Self.prototype.getBubbleAbove = function () {
            return this.getSelectorFromContainer(
                this._getBubbleAboveContainer()
            );
        };
        Self.prototype.hasBubbleAbove = function(){
            return this._getBubbleAboveContainer().length > 0;
        };
        Self.prototype.hasBubbleUnder = function(){
            return this._getBubbleUnderContainer().length > 0;
        };
        Self.prototype.getBubbleUnder = function () {
            return this.getSelectorFromContainer(
                this._getBubbleUnderContainer()
            );
        };
        Self.prototype._getBubbleUnderContainer = function(){
            return this.html.closest(
                ".vertex-tree-container"
            ).nextAll(
                ".vertex-tree-container:first"
            ).find("> .vertex-container")
        };
        Self.prototype._getBubbleAboveContainer = function(){
            return this.html.closest(
                ".vertex-tree-container"
            ).prevAll(
                ".vertex-tree-container:first"
            ).find("> .vertex-container");
        };
        Self.prototype._getParentBubbleContainer = function () {
            return this.html.closest(".vertices-children-container")
                .siblings(".vertex-container");
        };
        Self.prototype.hasChildren = function () {
            return this.getChildrenBubblesHtml().length > 0;
        };
        Self.prototype.getSelectorFromContainer = function(container){
            var vertexHtml = container.find("> .vertex");
            return vertexHtml.length > 0 ?
                getVertexSelector().withHtml(vertexHtml) :
                getRelationFromParentContainer(container);
        };

        Self.prototype.hasHiddenRelationsContainer = function(){
            return undefined !== this.getHiddenRelationsContainer();
        };

        Self.prototype.setHiddenRelationsContainer = function(hiddenRelationsContainer){
            this.html.data(
                "hidden_properties_indicator",
                hiddenRelationsContainer
            );
        };

        Self.prototype.getHiddenRelationsContainer = function(){
            return this.html.data(
                "hidden_properties_indicator"
            );
        };

        Self.prototype.removeHiddenRelationsContainer = function(){
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().remove();
            }
            this.html.removeData(
                "hidden_properties_indicator"
            );
        };

        Self.prototype.refreshImages = function () {
            var imageMenu =
                this.hasImagesMenu() ?
                    this.getImageMenu() :
                    this.createImageMenu();
            imageMenu.refreshImages();
        };
        Self.prototype.addImages = function (images) {
            var existingImages = this.getImages();
            this.html.data(
                "images",
                existingImages.concat(
                    images
                )
            );
        };
        Self.prototype.removeImage = function (imageToRemove) {
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
        Self.prototype.getImages = function () {
            return this.html.data("images") === undefined ?
                [] :
                this.html.data("images");
        };
        Self.prototype.hasImagesMenu = function () {
            return this.html.data("images_menu") !== undefined;
        };
        Self.prototype.createImageMenu = function () {
            var imageMenu = ImageDisplayer.ofBubble(
                this.htmlFacade
            ).create();
            this.html.data("images_menu", imageMenu);
            return imageMenu;
        };
        Self.prototype.getImageMenu = function () {
            return this.html.data("images_menu");
        };
        Self.prototype.impactOnRemovedIdentification = function (identification) {
            var self = this;
            $.each(identification.getImages(), function () {
                var image = this;
                self.removeImage(image);
            });
            if(this.hasImagesMenu()){
                this.getImageMenu().refreshImages();
            }
        };

        Self.prototype.integrateIdentification = function (identification) {
            this.addImages(
                identification.getImages()
            );
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function(event, triple, sourceBubble){
                sourceBubble.removeHiddenRelationsContainer();
                var destinationHtml = triple.destinationVertex().getHtml();
                if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                    destinationHtml.centerOnScreenWithAnimation();
                }
            }
        );
        return api;
        function getVertexSelector(){
            return MindMapInfo.isSchemaMode() ?
                GraphDisplayer.getSchemaSelector() :
                GraphDisplayer.getVertexSelector();
        }
        function getRelationFromParentContainer(parentContainer){
            var isSchemaMode = MindMapInfo.isSchemaMode(),
                html = parentContainer.find(
                    isSchemaMode ?
                        "> .property" :
                        "> .group-relation"
                );
                return isSchemaMode ?
                    GraphDisplayer.getPropertySelector().withHtml(html) :
                    GraphDisplayer.getGroupRelationSelector().withHtml(html);
        }
    }
);
