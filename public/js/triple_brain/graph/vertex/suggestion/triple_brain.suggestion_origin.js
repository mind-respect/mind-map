/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource"
], function ($, FriendlyResource) {
    "use strict";
    var api = {
        IDENTIFICATION_PREFIX: "identification_",
        COMPARISON_PREFIX: "comparison_"
    };
    api.fromServerFormat = function (serverFormat) {
        return new Self(serverFormat);
    };
    api.fromServerArray = function (serverArray) {
        var origins = [];
        $.each(serverArray, function () {
            origins.push(
                api.fromServerFormat(this)
            );
        });
        return origins;
    };
    api.buildObjectWithUriAndOrigin = function (uri, origin) {
        return {
            friendlyResource: FriendlyResource.buildObjectWithUri(
                uri
            ),
            origin: origin
        };
    };
    function Self(serverFormat) {
        this.originServerFormat = serverFormat;
        FriendlyResource.Self.apply(
            this
        );
        FriendlyResource.Self.prototype.init.call(
            this,
            serverFormat.friendlyResource
        );
    }

    Self.prototype = new FriendlyResource.Self();
    Self.prototype.getOrigin = function () {
        return this.originServerFormat.origin;
    };
    Self.prototype.isFromComparison = function () {
        return api.COMPARISON_PREFIX === this._getOriginPrefix();
    };
    Self.prototype._getOriginPrefix = function () {
        return this.originServerFormat.origin.substring(
            0,
            this.originServerFormat.origin.indexOf("_")
        );
    };
    Self.prototype.getServerFormat = function () {
        return {
            friendlyResource: FriendlyResource.Self.prototype.getServerFormat.call(this),
            origin: this.getOrigin()
        };
    };
    return api;
});