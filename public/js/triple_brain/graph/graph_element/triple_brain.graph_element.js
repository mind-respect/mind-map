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
    api.sortCompare = function (a, b) {
        if (a.getSortDate() === b.getSortDate()) {
            if (a.getMoveDate() === b.getMoveDate()) {
                return 0;
            }
            if (a.getMoveDate() > b.getMoveDate()) {
                return -1;
            }
            return 1;
        }
        if (a.getSortDate() > b.getSortDate()) {
            return 1;
        }
        return -1;
    };
    api.fromServerFormat = function (serverFormat) {
        return new api.GraphElement().init(
            serverFormat
        );
    };
    api.buildServerFormatFromUi = function (graphElementUi) {
        var identifications = {};
        $.each(graphElementUi.getIdentifications(), function () {
            identifications[
                this.getExternalResourceUri()
                ] = this.getServerFormat();
        });
        return {
            friendlyResource: FriendlyResource.buildServerFormatFromUi(
                graphElementUi
            ),
            identifications: identifications
        };
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
        if (suggestion.hasType()) {
            var type = suggestion.getType();
            type.setType("type");
            serverFormat.identifications.push(
                type.getServerFormat()
            );
        }
        return api.fromServerFormat(
            serverFormat
        );
    };
    api.withUri = function (uri) {
        return api.fromServerFormat(
            api.buildObjectWithUri(
                uri
            )
        );
    };
    api.buildObjectWithUri = function (uri) {
        return {
            friendlyResource: FriendlyResource.buildObjectWithUri(
                uri
            )
        };
    };
    api.fromDetailedSearchResult = function (detailedSearchResult) {
        return api.fromServerFormat(
            detailedSearchResult.graphElement
        );
    };
    api.GraphElement = function () {
    };

    api.GraphElement.prototype = new FriendlyResource.FriendlyResource();

    api.GraphElement.prototype.init = function (graphElementServerFormat) {
        this.graphElementServerFormat = graphElementServerFormat;
        this._buildIdentifications();
        FriendlyResource.FriendlyResource.apply(
            this
        );
        FriendlyResource.FriendlyResource.prototype.init.call(
            this,
            graphElementServerFormat.friendlyResource
        );
        return this;
    };

    api.GraphElement.prototype.getTypes = function () {
        return this._types;
    };
    api.GraphElement.prototype.getSameAs = function () {
        return this._sameAs;
    };
    api.GraphElement.prototype.getGenericIdentifications = function () {
        return this._genericIdentifications;
    };
    api.GraphElement.prototype.hasIdentifications = function () {
        return this.getIdentifications().length > 0;
    };
    api.GraphElement.prototype.getIdentifications = function () {
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

    api.GraphElement.prototype._buildIdentifications = function () {
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
            switch (identification.getType()) {
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
    api.GraphElement.prototype.hasIdentification = function (identification) {
        var contains = false;
        $.each(this.getIdentifications(), function () {
            if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
                contains = true;
                return false;
            }
        });
        return contains;
    };

    api.GraphElement.prototype.isRelatedToIdentification = function (identification) {
        return identification.getExternalResourceUri() === this.getUri() ||
            this.hasIdentification(identification);
    };

    api.GraphElement.prototype.addGenericIdentification = function (identification) {
        this._genericIdentifications.push(identification);
    };

    api.GraphElement.prototype.addSameAs = function (identification) {
        this._sameAs.push(identification);
    };
    api.GraphElement.prototype.addType = function (identification) {
        this._types.push(identification);
    };

    api.GraphElement.prototype.setSortDate = function (sortDate) {
        this.graphElementServerFormat.sortDate = sortDate.getTime();
        this.graphElementServerFormat.moveDate = new Date().getTime();
    };

    api.GraphElement.prototype.getSortDate = function () {
        if (undefined === this.graphElementServerFormat.sortDate) {
            return this.getCreationDate();
        }
        return new Date(
            this.graphElementServerFormat.sortDate
        );
    };

    api.GraphElement.prototype.getMoveDate = function () {
        if (undefined === this.graphElementServerFormat.moveDate) {
            return this.getCreationDate();
        }
        return new Date(
            this.graphElementServerFormat.moveDate
        );
    };

    return api;
});