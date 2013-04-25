/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.server_subscriber",
    "triple_brain.ui.vertex",
    "triple_brain.id_uri",
    "triple_brain.image",
    "triple_brain.event_bus",
    "jquery.json.min"
],
    function (require, $, ServerSubscriber, Vertex, IdUriUtils, Image, EventBus) {
        var api = {};
        api.withUriAndLabel = function(uri, label){
            return new ExternalResource(
                uri,
                label,
                "",
                []
            );
        }
        api.fromFreebaseSuggestion = function(freebaseSuggestion){
            var Freebase = require("triple_brain.freebase");
            return new ExternalResource(
                Freebase.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                freebaseSuggestion.name,
                undefined,
                []
            )
        }
        api.fromServerJson = function(serverJson){
            return new ExternalResource(
                serverJson.uri,
                serverJson.label,
                serverJson.description,
                Image.arrayFromServerJson(serverJson.images)
            )
        }

        function ExternalResource(uri, label, description, images) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            }
            this.label = function () {
                return label;
            }
            this.description = function(){
                return description === undefined ? "" : description;
            }
            this.images = function(){
                return images;
            }
            this.listenForUpdates = function(listenerReadyCallBack){
                ServerSubscriber.subscribe(
                    "/identification/" + IdUriUtils.encodeUri(thisExternalResource.uri()) +  "/updated",
                    updateWithServerJson,
                    listenerReadyCallBack
                );
            }
            function updateWithServerJson(externalResourceAsJson){
                var externalResource = api.fromServerJson(
                    externalResourceAsJson
                );
                uri = externalResource.uri();
                label = externalResource.label();
                description = externalResource.description();
                images = externalResource.images();
                getVertex().visitAllVertices(function(vertex){
                    $.each(vertex.getIdentifications(), function(){
                        var identification = this;
                        if(identification.uri() === thisExternalResource.uri()){
                            vertex.addImages(images);
                        }
                    });
                });
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
                    images : thisExternalResource.images
                }
            }
            this.setType = function(type){
                thisExternalResource.type = type;
            }
            this.getType = function(){
                return thisExternalResource.type;
            }
        }
        function getVertex(){
            if(Vertex === undefined){
                Vertex = require("triple_brain.ui.vertex")
            }
            return Vertex;
        }
        return api;
    }
);