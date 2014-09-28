/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource",
    "triple_brain.identification"
], function (FriendlyResource, Identification) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(
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
    api.Self = function () {};

    api.Self.prototype = new FriendlyResource.Self;

    api.Self.prototype.init = function(graphElementServerFormat){
        this.graphElementServerFormat = graphElementServerFormat;
        this._types = this._buildTypes();
        this._sameAs = this._buildSameAs();
        this._genericIdentifications = this._buildGenericIdentifications();
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
    api.Self.prototype._buildTypes = function() {
        var types = [];
        if (undefined === this.graphElementServerFormat.additionalTypes) {
            return types;
        }
        $.each(this.graphElementServerFormat.additionalTypes, function () {
            types.push(
                Identification.fromServerFormat(
                    this
                )
            );
        });
        return types;
    };

    api.Self.prototype._buildSameAs = function() {
        var sameAs = [];
        if (undefined === this.graphElementServerFormat.sameAs) {
            return sameAs;
        }
        $.each(this.graphElementServerFormat.sameAs, function () {
            sameAs.push(
                Identification.fromServerFormat(
                    this
                )
            );
        });
        return sameAs;
    };

    api.Self.prototype._buildGenericIdentifications = function() {
        var genericIdentifications = [];
        if (undefined === this.graphElementServerFormat.genericIdentifications) {
            return genericIdentifications;
        }
        $.each(this.graphElementServerFormat.genericIdentifications, function () {
            genericIdentifications.push(
                Identification.fromServerFormat(
                    this
                )
            );
        });
        return genericIdentifications;
    };

    return api;
});