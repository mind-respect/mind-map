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
                new CenterGraphElement().init(
                    this
                )
            );
        });
        return elements;
    };
    function CenterGraphElement() {
    }

    CenterGraphElement.prototype = new FriendlyResource.FriendlyResource();
    CenterGraphElement.prototype.init = function (serverFormat) {
        this.centerGraphElementServerFormat = serverFormat;
        FriendlyResource.FriendlyResource.apply(
            this.centerGraphElementServerFormat.graphElement.friendlyResource
        );
        FriendlyResource.FriendlyResource.prototype.init.call(
            this,
            this.centerGraphElementServerFormat.graphElement.friendlyResource
        );
        return this;
    };
    CenterGraphElement.prototype.getNumberOfVisits = function () {
        return this.centerGraphElementServerFormat.numberOfVisits;
    };
    CenterGraphElement.prototype.getLastCenterDate = function () {
        return new Date(this.centerGraphElementServerFormat.lastCenterDate);
    };
    CenterGraphElement.prototype.getContext = function () {
        return this.centerGraphElementServerFormat.context;
    };
    CenterGraphElement.prototype.setVisitRank = function (rank) {
        this.visitRank = rank;
    };
    CenterGraphElement.prototype.getNumberOfVisitsRank = function () {
        return this.visitRank;
    };
    CenterGraphElement.prototype.getFormattedContext = function () {
        var formattedContext = "";
        var contextUris = Object.keys(this.centerGraphElementServerFormat.context);
        for(var i = 0 ; i < contextUris.length; i++){
            formattedContext += this.centerGraphElementServerFormat.context[contextUris[i]];
            formattedContext += (i ===  contextUris.length - 1) ? " ..." : " ● ";
        }
        return formattedContext;
    };
    return api;
});