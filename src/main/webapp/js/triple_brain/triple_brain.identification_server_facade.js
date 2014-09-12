/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource_server_facade",
    "triple_brain.freebase_uri"
], function (FriendlyResourceServerFacade, FreebaseUri) {
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Self(
            serverFormat
        );
    };
    api.withUriLabelAndDescription = function (uri, label, description) {
        return new api.Self({
            externalResourceUri: uri,
            friendlyResource: FriendlyResourceServerFacade.withLabelAndDescription(
                label,
                description
            ).getServerFormat()
        });
    };
    api.withUriAndLabel = function (uri, label) {
        return new api.Self({
            externalResourceUri: uri,
            friendlyResource: FriendlyResourceServerFacade.withLabel(
                label
            ).getServerFormat()
        });
    };
    api.fromFreebaseSuggestion = function (freebaseSuggestion) {
        return api.withUriAndLabel(
            FreebaseUri.freebaseIdToURI(
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
        this.serverFormat = serverFormat;
        FriendlyResourceServerFacade.Self.apply(
            this
        );
        this.init(
            serverFormat.friendlyResource
        );
    };
    api.Self.prototype = new FriendlyResourceServerFacade.Self;
    api.Self.prototype.getExternalResourceUri = function () {
        return this.serverFormat.externalResourceUri;
    };
    api.Self.prototype.getServerFormat = function () {
        return this.serverFormat;
    };
    api.Self.prototype.setType = function (type) {
        this.serverFormat.type = type;
    };
    api.Self.prototype.getType = function () {
        return this.serverFormat.type;
    };
    api.Self.prototype.getJsonFormat = function () {
        return $.toJSON(
            this.serverFormat
        );
    };
    api.Self.prototype.isAGraphElement = function () {
        return this.getExternalResourceUri().indexOf("/service") === 0;
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
    return api;
});