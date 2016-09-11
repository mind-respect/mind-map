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
    api.getServerFormatArrayFromFacadeArray = function (identifications) {
        var serverFormat = [];
        $.each(identifications, function(){
            serverFormat.push(
                this.getServerFormat()
            );
        });
        return serverFormat;
    };
    api.fromServerFormat = function (serverFormat) {
        return new api.Identification().init(serverFormat);
    };
    api.fromFriendlyResourceServerFormat = function (serverFormat) {
        return api.fromFriendlyResource(
            FriendlyResource.fromServerFormat(serverFormat)
        );
    };

    api.fromFriendlyResource = function (friendlyResource) {
        var identification = new api.Identification().init({
            externalResourceUri: friendlyResource.getUri(),
            friendlyResource: FriendlyResource.clone(friendlyResource).getServerFormat()
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
        return new api.Identification().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriLabelAndDescription(
                uri,
                label,
                description
            ).getServerFormat()
        });
    };
    api.withUriAndLabel = function (uri, label) {
        return new api.Identification().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriAndLabel(
                uri,
                label
            ).getServerFormat()
        });
    };
    api.withUri = function (uri) {
        return new api.Identification().init({
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
    api.Identification = function () {
    };

    api.Identification.prototype = new FriendlyResource.FriendlyResource();

    api.Identification.prototype.init = function (serverFormat) {
        this.identificationServerFormat = serverFormat;
        FriendlyResource.FriendlyResource.apply(
            this
        );
        FriendlyResource.FriendlyResource.prototype.init.call(
            this,
            serverFormat.friendlyResource
        );
        return this;
    };

    api.Identification.prototype.getExternalResourceUri = function () {
        return decodeURIComponent(
            this.identificationServerFormat.externalResourceUri
        );
    };
    api.Identification.prototype.getServerFormat = function () {
        return this.identificationServerFormat;
    };
    api.Identification.prototype.setType = function (type) {
        this.identificationServerFormat.identificationType = type;
    };
    api.Identification.prototype.makeGeneric = function () {
        this.setType(
            "generic"
        );
        return this;
    };
    api.Identification.prototype.makeSameAs = function () {
        this.setType(
            "same_as"
        );
        return this;
    };
    api.Identification.prototype.getFirstIdentificationToAGraphElement = function () {
        return IdUri.isUriOfAGraphElement(this.getExternalResourceUri()) ?
            this : false;
    };
    api.Identification.prototype.getType = function () {
        return this.identificationServerFormat.identificationType;
    };
    api.Identification.prototype.hasType = function () {
        return undefined !== this.getType();
    };
    api.Identification.prototype.getJsonFormat = function () {
        var serverFormat = this.getServerFormat();
        serverFormat.friendlyResource.images = this.getImagesServerFormat();
        return JSON.stringify(
            serverFormat
        );
    };

    api.Identification.prototype.rightActionForType = function (typeAction, sameAsAction, genericIdentificationAction) {
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

    api.Identification.prototype.getNbReferences = function () {
        if (this.identificationServerFormat.nbReferences === undefined) {
            return 0;
        }
        return this.identificationServerFormat.nbReferences;
    };

    return api;
});