/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.image"
], function (Image) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.FriendlyResource().init(serverFormat);
    };
    api.clone = function (friendlyResource) {
        return api.fromServerFormat({
            uri: friendlyResource.getUri(),
            label: friendlyResource.getLabel(),
            comment: friendlyResource.getComment()
        });
    };
    api.buildObjectWithUri = function (uri) {
        return {
            uri: uri,
            label: ""
        };
    };
    api.buildServerFormatFromUi = function (friendlyResourceUi) {
        return {
            uri: friendlyResourceUi.getUri(),
            label: friendlyResourceUi.text(),
            comment: friendlyResourceUi.getModel().getComment()
        };
    };
    api.buildObjectWithUriAndLabel = function (uri, label) {
        return {
            uri: uri,
            label: label
        };
    };
    api.buildObjectWithUriLabelAndDescription = function (uri, label, description) {
        return {
            uri: uri,
            label: label,
            comment: description
        };
    };
    api.buildObjectWithUriLabelDescriptionAndImages = function (uri, label, description, images) {
        return {
            uri: uri,
            label: label,
            comment: description,
            images: images
        };
    };
    api.withUri = function (uri) {
        return api.withUriAndLabel(
            uri,
            ""
        );
    };
    api.withUriAndLabel = function (uri, label) {
        return api.fromServerFormat(
            api.buildObjectWithUriAndLabel(uri, label)
        );
    };
    api.withUriLabelAndDescription = function (uri, label, description) {
        return api.fromServerFormat(
            api.buildObjectWithUriLabelAndDescription(uri, label, description)
        );
    };
    api.FriendlyResource = function () {
    };

    api.FriendlyResource.prototype.init = function (friendlyResourceServerFormat) {
        this.friendlyResourceServerFormat = friendlyResourceServerFormat;
        this._images = this._buildImages();
        if (friendlyResourceServerFormat.comment === undefined) {
            friendlyResourceServerFormat.comment = "";
        }
        if (friendlyResourceServerFormat.label === undefined) {
            this.friendlyResourceServerFormat.label = "";
        }
        return this;
    };

    api.FriendlyResource.prototype.setLabel = function (label) {
        this.friendlyResourceServerFormat.label = label;
    };

    api.FriendlyResource.prototype.getLabel = function () {
        return this.friendlyResourceServerFormat.label;
    };
    api.FriendlyResource.prototype.isLabelEmpty = function () {
        return this.getLabel().trim() === "";
    };
    api.FriendlyResource.prototype.getComment = function () {
        return this.friendlyResourceServerFormat.comment;
    };
    api.FriendlyResource.prototype.setComment = function (comment) {
        return this.friendlyResourceServerFormat.comment = comment;
    };
    api.FriendlyResource.prototype.hasComment = function () {
        return this.friendlyResourceServerFormat.comment.length > 0;
    };
    api.FriendlyResource.prototype.addImage = function (image) {
        this._images.push(image);
    };
    api.FriendlyResource.prototype.getImages = function () {
        return this._images;
    };
    api.FriendlyResource.prototype.hasImages = function () {
        return this._images.length > 0;
    };
    api.FriendlyResource.prototype.setUri = function (uri) {
        this.friendlyResourceServerFormat.uri = uri;
    };
    api.FriendlyResource.prototype.getUri = function () {
        return decodeURIComponent(
            this.friendlyResourceServerFormat.uri
        );
    };
    api.FriendlyResource.prototype.getJsonFormat = function () {
        var serverFormat = this.getServerFormat();
        serverFormat.images = this.getImagesServerFormat();
        return JSON.stringify(
            serverFormat
        );
    };
    api.FriendlyResource.prototype.getImagesServerFormat = function () {
        return Image.arrayToServerJson(
            this._images
        );
    };
    api.FriendlyResource.prototype.getServerFormat = function () {
        return this.friendlyResourceServerFormat;
    };
    api.FriendlyResource.prototype.getCreationDate = function () {
        return this.friendlyResourceServerFormat.creationDate === undefined ?
            new Date() :
            new Date(
                this.friendlyResourceServerFormat.creationDate
            );
    };
    api.FriendlyResource.prototype._buildImages = function () {
        return undefined === this.friendlyResourceServerFormat.images ?
            [] :
            Image.arrayFromServerJson(
                this.friendlyResourceServerFormat.images
            );
    };
    return api;
});