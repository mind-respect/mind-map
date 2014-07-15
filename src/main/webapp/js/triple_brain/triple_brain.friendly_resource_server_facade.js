/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.image",
    "jquery.json.min"
], function (Image) {
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
    api.withLabel = function(label){
        return new api.Object({
            label : label
        });
    };
    api.withLabelAndDescription = function(label, description){
        return new api.Object({
            label : label,
            description: description
        });
    };
    api.withUriLabelAndDescription = function (uri, label, description) {
        return new api.Object({
                uri : uri,
                label: label,
                comment: description
            }
        );
    };
    api.Object = function (serverFormat) {
        var _images = buildImages(),
            self = this;
        if(serverFormat.comment === undefined){
            serverFormat.comment = "";
        }
        this.getLabel = function () {
            return serverFormat.label;
        };
        this.getComment = function () {
            return serverFormat.comment;
        };
        this.setComment = function(comment){
            return serverFormat.comment = comment;
        };
        this.hasComment = function(){
            return serverFormat.comment.length > 0;
        };
        this.getImages = function () {
            return _images;
        };
        this.hasImages = function(){
            return _images.length > 0;
        };
        this.setUri = function(uri){
            serverFormat.uri = uri;
        };
        this.getUri = function () {
            return serverFormat.uri;
        };
        this.getJsonFormat = function () {
            return $.toJSON(
                self.getServerFormat()
            );
        };
        this.getServerFormat = function () {
            return serverFormat
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