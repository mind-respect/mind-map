/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.image",
    "triple_brain.freebase_uri",
    "jquery.json.min"
], function (Image, FreebaseUri) {
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Object(
            serverFormat
        );
    };
    api.buildObjectWithUri = function (uri) {
        return {
            uri : uri,
            label: ""
        };
    };
    api.withUri = function (uri) {
        return api.withUriAndLabel(
            uri,
            ""
        );
    };
    api.withUriAndLabel = function (uri, label) {
        return new api.Object({
                uri : uri,
                label: label
            }
        );
    };
    api.withUriLabelAndDescription = function (uri, label, description) {
        return new api.Object({
                uri : uri,
                label: label,
                comment: description
            }
        );
    };
    api.fromFreebaseSuggestion = function (freebaseSuggestion) {
        return api.withUriAndLabel(
            FreebaseUri.freebaseIdToURI(
                freebaseSuggestion.id
            ),
            freebaseSuggestion.name
        )
    };
    api.fromSearchResult = function (searchResult) {
        return api.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.comment
        );
    };
    api.Object = function (serverFormat) {
        var _images = buildImages(),
            self = this;
        this.getLabel = function () {
            return serverFormat.label;
        };
        this.getComment = function () {
            return serverFormat.comment;
        };
        this.getImages = function () {
            return _images;
        };
        this.getUri = function () {
            return serverFormat.uri;
        };
        this.getCreationDate = function(){
            return new Date(
                serverFormat.creationDate
            );
        };
        this.getLastModificationDate = function(){
            return new Date(
                serverFormat.lastModificationDate
            );
        };
        this.getJsonFormat = function () {
            return $.toJSON(
                self.getServerFormat()
            );
        };
        this.getServerFormat = function () {
            return serverFormat
        };
        this.setType = function (type) {
            serverFormat.type = type;
        };
        this.getType = function () {
            return serverFormat.type;
        };
        this.isAGraphElement = function () {
            return serverFormat.uri.indexOf("/service") === 0;
        };
        function buildImages() {
            return undefined === serverFormat.images ?
                [] :
                Image.arrayFromServerJson(
                    serverFormat.images
                );
        }
    };
    return api;
});