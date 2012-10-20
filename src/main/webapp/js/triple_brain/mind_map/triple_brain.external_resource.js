/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.server_subscriber",
    "triple_brain.id_uri",
    "jquery.json.min"
],
    function (require, $, ServerSubscriber, IdUriUtils) {
        var api = {};
        api.withUriLabelAndImageLink = function(uri, label, imageLink){
            return new ExternalResource(
                uri,
                label,
                imageLink
            );
        }
        api.withUriAndLabel = function(uri, label){
            return new ExternalResource(
                uri,
                label
            );
        }
        api.fromFreebaseSuggestion = function(freebaseSuggestion){
            var Freebase = require("triple_brain.freebase");
            return new ExternalResource(
                Freebase.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                freebaseSuggestion.name,
                Freebase.BASE_PATH_FOR_SMALL_IMAGE +
                    freebaseSuggestion.id
            )
        }
        api.fromServerJson = function(serverJson){
            return new ExternalResource(
                serverJson.uri,
                serverJson.label,
                serverJson.image_url
            )
        }

        function ExternalResource(uri, label, imageUrl) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            }
            this.label = function () {
                return label;
            }
            this.hasImage = function(){
                return imageUrl !== undefined;
            }
            this.imageUrl = function(){
                return imageUrl;
            }
            this.listenForNewImages = function(listenerReadyCallBack){
                ServerSubscriber.subscribe(
                    "/identification/" + IdUriUtils.encodeUri(thisExternalResource.uri()) +  "/images/updated",
                    updateImages,
                    listenerReadyCallBack
                )
            }
            function updateImages(images){
                console.log("images updated");
                console.log(images);
            }
            this.serverFormat = function(){
                return $.toJSON(
                    thisExternalResource.jsonFormat()
                );
            }
            this.jsonFormat = function(){
                return {
                    uri : thisExternalResource.uri(),
                    label : thisExternalResource.label(),
                    image_url : thisExternalResource.imageUrl()
                }
            }
            this.setType = function(type){
                thisExternalResource.type = type;
            }
            this.getType = function(){
                return thisExternalResource.type;
            }
        }
        return api;
    }
);