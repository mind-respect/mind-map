/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.id_uri",
    "jquery.triple_brain.search"
], function ($, FriendlyResource, IdUri, $Search) {
    "use strict";
    var api = {};
    api.fromMultipleServerFormat = function (serverFormat, type) {
        var identifications = {};
        $.each(serverFormat, function (externalUri, identificationServerFormat) {
            var identification = api.fromServerFormat(
                identificationServerFormat
            );
            identification.setType(type);
            identifications[externalUri] = identification;
        });
        return identifications;
    };
    api.fromServerFormat = function (serverFormat) {
        return new api.Self().init(serverFormat);
    };
    api.fromFriendlyResourceServerFormat = function (serverFormat) {
        return api.fromFriendlyResource(
            FriendlyResource.fromServerFormat(serverFormat)
        );
    };

    api.fromFriendlyResource = function (friendlyResource) {
        var identification = new api.Self().init({
            externalResourceUri: friendlyResource.getUri(),
            friendlyResource: friendlyResource.getServerFormat()
        });
        identification.setLabel(
            friendlyResource.getLabel()
        );
        identification.setComment(
            friendlyResource.getComment()
        );
        return identification;
    };

    api.withUriLabelAndDescription = function (uri, label, description) {
        return new api.Self().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriLabelAndDescription(
                uri,
                label,
                description
            ).getServerFormat()
        });
    };
    api.withUriAndLabel = function (uri, label) {
        return new api.Self().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriAndLabel(
                uri,
                label
            ).getServerFormat()
        });
    };
    api.withUri = function (uri) {
        return new api.Self().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUri(
                uri
            ).getServerFormat()
        });
    };
    api.fromSearchResult = function (searchResult) {
        var identification = api.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.comment
        );
        if ($Search.hasCachedDetailsForSearchResult(searchResult)) {
            var moreInfo = $Search.getCachedDetailsOfSearchResult(searchResult);
            if (moreInfo.image !== undefined) {
                identification.addImage(moreInfo.image);
            }
            if (!identification.hasComment() && moreInfo.comment !== "") {
                identification.setComment(moreInfo.comment);
            }
        }
        return identification;
    };
    api.Self = function () {
    };

    api.Self.prototype = new FriendlyResource.Self();

    api.Self.prototype.init = function (serverFormat) {
        this.identificationServerFormat = serverFormat;
        FriendlyResource.Self.apply(
            this
        );
        FriendlyResource.Self.prototype.init.call(
            this,
            serverFormat.friendlyResource
        );
        return this;
    };

    api.Self.prototype.getExternalResourceUri = function () {
        return decodeURIComponent(
            this.identificationServerFormat.externalResourceUri
        );
    };
    api.Self.prototype.getServerFormat = function () {
        return this.identificationServerFormat;
    };
    api.Self.prototype.setType = function (type) {
        this.identificationServerFormat.identificationType = type;
    };
    api.Self.prototype.getType = function () {
        return this.identificationServerFormat.identificationType;
    };
    api.Self.prototype.getJsonFormat = function () {
        var serverFormat = this.getServerFormat();
        serverFormat.friendlyResource.images = this.getImagesServerFormat();
        return JSON.stringify(
            serverFormat
        );
    };

    api.Self.prototype.rightActionForType = function (typeAction, sameAsAction, genericIdentificationAction) {
        switch (this.getType()) {
            case "type" :
                return typeAction;
            case "same_as"  :
                return sameAsAction;
            case "generic"  :
                return genericIdentificationAction;
            default :
                return function () {
                };
        }
    };

    api.Self.prototype.getNbReferences = function () {
        if (this.identificationServerFormat.nbReferences === undefined) {
            return 0;
        }
        return this.identificationServerFormat.nbReferences;
    };

    return api;
});