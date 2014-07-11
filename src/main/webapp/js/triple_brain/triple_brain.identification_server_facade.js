/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.friendly_resource_server_facade",
    "triple_brain.freebase_uri"
],function(FriendlyResourceServerFacade, FreebaseUri){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    api.withUriLabelAndDescription = function (uri, label, description) {
        return new Object({
            externalResourceUri: uri,
            friendlyResource : FriendlyResourceServerFacade.withLabelAndDescription(
                label,
                description
            ).getServerFormat()
        });
    };
    api.withUriAndLabel = function(uri, label){
        return new Object({
            externalResourceUri: uri,
            friendlyResource : FriendlyResourceServerFacade.withLabel(
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
    return api;
    function Object(serverFormat){
        var self = this;
        FriendlyResourceServerFacade.Object.apply(
            this, [serverFormat.friendlyResource]
        );
        this.getExternalResourceUri = function(){
            return serverFormat.externalResourceUri;
        };
        this.getServerFormat = function(){
            return serverFormat;
        };
        this.setType = function (type) {
            serverFormat.type = type;
        };
        this.getType = function () {
            return serverFormat.type;
        };
        this.getJsonFormat = function(){
            return $.toJSON(
                serverFormat
            );
        };
        this.isAGraphElement = function () {
            return self.getExternalResourceUri().indexOf("/service") === 0;
        };
    }
});