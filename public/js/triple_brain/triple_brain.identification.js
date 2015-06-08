/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.friendly_resource",
    "triple_brain.id_uri",
    "jquery.triple_brain.search"
], function (FriendlyResource, IdUri, $Search) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self(
            serverFormat
        );
    };
    api.fromFriendlyResourceServerFormat = function (serverFormat) {
        return api.fromFriendlyResource(
            FriendlyResource.fromServerFormat(serverFormat)
        );
    };

    api.fromFriendlyResource = function (friendlyResource) {
        return new api.Self({
            externalResourceUri: friendlyResource.getUri(),
            friendlyResource: friendlyResource.getServerFormat()
        });
    };

    api.withUriLabelAndDescription = function (uri, label, description) {
        return new api.Self({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriLabelAndDescription(
                uri,
                label,
                description
            ).getServerFormat()
        });
    };
    api.withUriAndLabel = function (uri, label) {
        return new api.Self({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriAndLabel(
                uri,
                label
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
    api.Self = function (serverFormat) {
        this.identificationServerFormat = serverFormat;
        FriendlyResource.Self.apply(
            this
        );
        this.init(
            serverFormat.friendlyResource
        );
    };
    api.Self.prototype = new FriendlyResource.Self();
    api.Self.prototype.getExternalResourceUri = function () {
        return this.identificationServerFormat.externalResourceUri;
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
            default :
                return genericIdentificationAction;
        }
    };
    return api;
});