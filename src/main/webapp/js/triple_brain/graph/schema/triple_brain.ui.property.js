/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui",
    "triple_brain.bubble"
], function(TreeEdge, GraphElementUi, Bubble){
    "use strict";
    var api = {};
    api.withHtml = function(html){
        return new Self(html)
    };
    api.getWhenEmptyLabel = function(){
        return "property";
    };
    function Self(html){
        this.html = html;
        this.bubble = Bubble.withHtmlFacade(this);
        TreeEdge.Self.apply(this);
        this.init(this.html);
    }
    Self.prototype = new TreeEdge.Self;
    Self.prototype.getGraphElementType = function(){
        return GraphElementUi.Types.Property;
    };
    Self.prototype.isToTheLeft = Self.prototype.isLeftOfCenterVertex = function () {
        return this.html.closest(
            ".vertices-children-container"
        ).hasClass("left-oriented");
    };
    Self.prototype.getLabel = function () {
        return this.html.find("> .in-bubble-content > input").is(":visible") ?
            this.html.find("> .in-bubble-content > input") :
            this.html.find("span.label");
    };
    Self.prototype.getParentBubble = function () {
        return this.bubble.getParentBubble();
    };
    Self.prototype.getParentVertex = function () {
        return this.bubble.getParentVertex();
    };
    Self.prototype.hasChildren = function () {
        return this.bubble.hasChildren();
    };
    Self.prototype.getTopMostChild = function () {
        return this.bubble.getTopMostChild();
    };
    Self.prototype.hasBubbleAbove = function () {
        return this.bubble.hasBubbleAbove();
    };
    Self.prototype.getBubbleAbove = function () {
        return this.bubble.getBubbleAbove();
    };
    Self.prototype.hasBubbleUnder = function () {
        return this.bubble.hasBubbleUnder();
    };
    Self.prototype.getBubbleUnder = function () {
        return this.bubble.getBubbleUnder();
    };
    Self.prototype.refreshImages = function () {
        this.bubble.refreshImages();
    };
    Self.prototype.createImageMenu = function () {
        return this.bubble.createImageMenu();
    };
    Self.prototype.addImages = function (images) {
        this.bubble.addImages(images);
    };
    Self.prototype.removeImage = function (imageToRemove) {
        this.bubble.removeImage(
            imageToRemove
        );
    };
    Self.prototype.getImages = function () {
        return this.bubble.getImages();
    };
    Self.prototype.hasImagesMenu = function () {
        return this.bubble.hasImagesMenu();
    };
    Self.prototype.getImageMenu = function () {
        return this.bubble.getImageMenu();
    };
    Self.prototype.impactOnRemovedIdentification = function (identification) {
        this.bubble.impactOnRemovedIdentification(identification);
    };
    Self.prototype.impactOnRemovedIdentification = function (identification) {
        this.bubble.impactOnRemovedIdentification(identification);
    };
    Self.prototype.integrateIdentification = function (identification) {
        this.addImages(
            identification.getImages()
        );
    };
    Self.prototype.remove = function () {
        this.html.closest(".vertex-tree-container").remove();
    };
    return api;
});
