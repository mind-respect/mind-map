/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.image",
    "jquery.json.min"
], function (Image) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(serverFormat);
    };
    api.buildObjectWithUri = function (uri) {
        return {
            uri: uri,
            label: ""
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
        }
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
    api.Self = function () {
    };

    api.Self.prototype.init = function (friendlyResourceServerFormat) {
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

    api.Self.prototype.setLabel = function (label) {
        this.friendlyResourceServerFormat.label = label;
    };

    api.Self.prototype.getLabel = function () {
        return this.friendlyResourceServerFormat.label;
    };
    api.Self.prototype.isLabelEmpty = function () {
        return this.getLabel().trim() === "";
    };
    api.Self.prototype.getComment = function () {
        return this.friendlyResourceServerFormat.comment;
    };
    api.Self.prototype.setComment = function (comment) {
        return this.friendlyResourceServerFormat.comment = comment;
    };
    api.Self.prototype.hasComment = function () {
        return this.friendlyResourceServerFormat.comment.length > 0;
    };
    api.Self.prototype.addImage = function (image) {
        this._images.push(image);
    };
    api.Self.prototype.getImages = function () {
        return this._images;
    };
    api.Self.prototype.hasImages = function () {
        return this._images.length > 0;
    };
    api.Self.prototype.setUri = function (uri) {
        this.friendlyResourceServerFormat.uri = uri;
    };
    api.Self.prototype.getUri = function () {
        return this.friendlyResourceServerFormat.uri;
    };
    api.Self.prototype.getJsonFormat = function () {
        var serverFormat = this.getServerFormat();
        serverFormat.images = this.getImagesServerFormat();
        return $.toJSON(
            serverFormat
        );
    };
    api.Self.prototype.getImagesServerFormat = function(){
        return Image.arrayToServerJson(
            this._images
        );
    };
    api.Self.prototype.getServerFormat = function () {
        return this.friendlyResourceServerFormat
    };
    api.Self.prototype._buildImages = function () {
        return undefined === this.friendlyResourceServerFormat.images ?
            [] :
            Image.arrayFromServerJson(
                this.friendlyResourceServerFormat.images
            );
    };
    return api;
});