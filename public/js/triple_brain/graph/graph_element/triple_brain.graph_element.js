/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.identification"
], function ($, FriendlyResource, Identification) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(
            serverFormat
        );
    };
    api.fromSuggestionAndElementUri = function (suggestion, elementUri) {
        var serverFormat = api.buildObjectWithUri(
            elementUri
        );
        serverFormat.identifications = [];
        var sameAs = suggestion.getSameAs();
        sameAs.setType("same_as");
        serverFormat.identifications.push(
            sameAs.getServerFormat()
        );
        var type = suggestion.getType();
        type.setType("type");
        serverFormat.identifications.push(
            type.getServerFormat()
        );
        return api.fromServerFormat(
            serverFormat
        );
    };
    api.withUri = function(uri){
        return api.fromServerFormat(
            api.buildObjectWithUri(
                uri
            )
        );
    };
    api.buildObjectWithUri = function(uri){
        return {
            friendlyResource : FriendlyResource.buildObjectWithUri(
                uri
            )
        };
    };
    api.fromDetailedSearchResult = function(detailedSearchResult){
        return api.fromServerFormat(
            detailedSearchResult.graphElement
        );
    };
    api.Self = function () {};

    api.Self.prototype = new FriendlyResource.Self();

    api.Self.prototype.init = function(graphElementServerFormat){
        this.graphElementServerFormat = graphElementServerFormat;
        this._buildIdentifications();
        FriendlyResource.Self.apply(
            this
        );
        FriendlyResource.Self.prototype.init.call(
            this,
            graphElementServerFormat.friendlyResource
        );
        return this;
    };

    api.Self.prototype.getTypes = function () {
        return this._types;
    };
    api.Self.prototype.getSameAs = function () {
        return this._sameAs;
    };
    api.Self.prototype.getGenericIdentifications = function () {
        return this._genericIdentifications;
    };
    api.Self.prototype.hasIdentifications = function () {
        return this.getIdentifications().length > 0;
    };
    api.Self.prototype.getIdentifications = function () {
        if (undefined === this._identifications) {
            this._identifications = [].concat(
                this._types
            ).concat(
                this._sameAs
            ).concat(
                this._genericIdentifications
            );
        }
        return this._identifications;
    };

    api.Self.prototype._buildIdentifications = function(){
        this._types = [];
        this._sameAs = [];
        this._genericIdentifications = [];
        if (undefined === this.graphElementServerFormat.identifications) {
            return;
        }
        var self = this;
        $.each(this.graphElementServerFormat.identifications, function () {
            var identification = Identification.fromServerFormat(
                this
            );
            switch(identification.getType()){
                case "generic" :
                    self._genericIdentifications.push(identification);
                    return;
                case "type":
                    self._types.push(identification);
                    return;
                case "same_as":
                    self._sameAs.push(identification);
            }
        });
    };
    return api;
});