/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource"
], function ($, FriendlyResource) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        var elements = [];
        $.each(serverFormat, function(){
            elements.push(
                new Self().init(
                    this
                )
            );
        });
        return elements;
    };
    function Self() {
    }

    Self.prototype = new FriendlyResource.Self();
    Self.prototype.init = function (serverFormat) {
        this.centerGraphElementServerFormat = serverFormat;
        FriendlyResource.Self.apply(
            this.centerGraphElementServerFormat.graphElement.friendlyResource
        );
        FriendlyResource.Self.prototype.init.call(
            this,
            this.centerGraphElementServerFormat.graphElement.friendlyResource
        );
        return this;
    };
    Self.prototype.getNumberOfVisits = function () {
        return this.centerGraphElementServerFormat.numberOfVisits;
    };
    return api;
});