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
        return new SuggestionOrigin(serverFormat);
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
    function SuggestionOrigin(serverFormat) {
        this.originServerFormat = serverFormat;
        FriendlyResource.FriendlyResource.apply(
            this
        );
        FriendlyResource.FriendlyResource.prototype.init.call(
            this,
            serverFormat.friendlyResource
        );
    }

    SuggestionOrigin.prototype = new FriendlyResource.FriendlyResource();
    SuggestionOrigin.prototype.getOrigin = function () {
        return this.originServerFormat.origin;
    };
    SuggestionOrigin.prototype.isFromComparison = function () {
        return api.COMPARISON_PREFIX === this._getOriginPrefix();
    };
    SuggestionOrigin.prototype._getOriginPrefix = function () {
        return this.originServerFormat.origin.substring(
            0,
            this.originServerFormat.origin.indexOf("_") + 1
        );
    };
    SuggestionOrigin.prototype.getServerFormat = function () {
        return {
            friendlyResource: FriendlyResource.FriendlyResource.prototype.getServerFormat.call(this),
            origin: this.getOrigin()
        };
    };
    return api;
});