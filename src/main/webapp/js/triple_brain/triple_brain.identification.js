/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource",
    "triple_brain.freebase_uri",
    "triple_brain.id_uri"
], function (FriendlyResource, FreebaseUri, IdUri) {
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

    api.fromFriendlyResource = function(friendlyResource){
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
    api.fromFreebaseSuggestion = function (freebaseSuggestion) {
        return api.withUriAndLabel(
            FreebaseUri.freebaseIdToUri(
                freebaseSuggestion.id
            ),
            freebaseSuggestion.name
        );
    };
    api.fromSearchResult = function (searchResult) {
        return api.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.comment
        );
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
    api.Self.prototype = new FriendlyResource.Self;
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
        return $.toJSON(
            serverFormat
        );
    };
    api.Self.prototype.isEligibleForContext = function () {
        return this.getExternalResourceUri().indexOf("/service") === 0 &&
            this.getExternalResourceUri().indexOf("/identification") === -1;
    };

    api.Self.prototype.rightActionForType = function(typeAction, sameAsAction, genericIdentificationAction){
        switch (this.getType()) {
            case "type" :
                return typeAction;
            case "same_as"  :
                return sameAsAction;
            default :
                return genericIdentificationAction;
        }
    };
    api.Self.prototype.isExternalResourceASchemaProperty = function () {
        return IdUri.isPropertyUri(
            this.getExternalResourceUri()
        );
    };
    return api;
});