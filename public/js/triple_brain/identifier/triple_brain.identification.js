/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.id_uri",
    "jquery.triple_brain.search"
], function ($, FriendlyResource, IdUri, Search) {
    "use strict";
    var RELATION_URIS = {
        "sameAs" : "same-as",
        "type" : "type",
        "generic": "generic"
    };
    var api = {};
    api.fromMultipleServerFormat = function (serverFormat, relationExternalResourceUri) {
        var identifications = {};
        $.each(serverFormat, function (externalUri, identificationServerFormat) {
            var identification = api.fromServerFormat(
                identificationServerFormat
            );
            identification.setRelationExternalResourceUri(
                relationExternalResourceUri
            );
            identifications[externalUri] = identification;
        });
        return identifications;
    };
    api.getServerFormatArrayFromFacadeArray = function (identifications) {
        var serverFormat = [];
        $.each(identifications, function () {
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
        if (Search.hasCachedDetailsForSearchResult(searchResult)) {
            var moreInfo = Search.getCachedDetailsOfSearchResult(searchResult);
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

    api.Identification.prototype.makeGeneric = function () {
        this.setRelationExternalResourceUri(
            RELATION_URIS.generic
        );
        return this;
    };
    api.Identification.prototype.makeType = function () {
        this.setRelationExternalResourceUri(
            RELATION_URIS.type
        );
        return this;
    };
    api.Identification.prototype.makeSameAs = function () {
        this.setRelationExternalResourceUri(
            RELATION_URIS.sameAs
        );
        return this;
    };
    api.Identification.prototype.getFirstIdentificationToAGraphElement = function () {
        return this.refersToAGraphElement() ?
            this : false;
    };
    api.Identification.prototype.refersToAGraphElement = function () {
        return IdUri.isUriOfAGraphElement(
            this.getExternalResourceUri()
        );
    };
    api.Identification.prototype.refersToOwnedGraphElement = function () {
        return this.refersToAGraphElement() && IdUri.isGraphElementUriOwnedByCurrentUser(
                this.getExternalResourceUri()
            );
    };
    api.Identification.prototype.refersToSchema = function () {
        return IdUri.isSchemaUri(
            this.getExternalResourceUri()
        );
    };
    api.Identification.prototype.setRelationExternalResourceUri = function (relationExternalResourceUri) {
        return this.identificationServerFormat.relationExternalResourceUri = relationExternalResourceUri;
    };
    api.Identification.prototype.getRelationExternalResourceUri = function () {
        return this.identificationServerFormat.relationExternalResourceUri;
    };
    api.Identification.prototype.hasRelationExternalUri = function () {
        return undefined !== this.getRelationExternalResourceUri();
    };

    api.Identification.prototype.getJsonFormat = function () {
        var serverFormat = this.getServerFormat();
        serverFormat.friendlyResource.images = this.getImagesServerFormat();
        return JSON.stringify(
            serverFormat
        );
    };

    api.Identification.prototype.getNbReferences = function () {
        if (this.identificationServerFormat.nbReferences === undefined) {
            return 0;
        }
        return this.identificationServerFormat.nbReferences;
    };

    api.Identification.prototype.getNbReferences = function () {
        if (this.identificationServerFormat.nbReferences === undefined) {
            return 0;
        }
        return this.identificationServerFormat.nbReferences;
    };

    api.Identification.prototype.isPublic = function(){
        return false;
    };

    api.Identification.prototype.hasIdentifications = function(){
        return false;
    };
    api.Identification.prototype.getIdentifiers = function(){
        return [this];
    };
    return api;
});