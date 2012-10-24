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
    "jquery.json.min"
],
    function (require, $, ServerSubscriber, Vertex, IdUriUtils, Image) {
        var api = {};
        api.withUriLabelAndImages = function(uri, label, images){
            return new ExternalResource(
                uri,
                label,
                images
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
                []
            )
        }
        api.fromServerJson = function(serverJson){
            return new ExternalResource(
                serverJson.uri,
                serverJson.label,
                Image.arrayFromServerJson(serverJson.images)
            )
        }

        function ExternalResource(uri, label, images) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            }
            this.label = function () {
                return label;
            }
            this.images = function(){
                return images;
            }
            this.listenForNewImages = function(listenerReadyCallBack){
                ServerSubscriber.subscribe(
                    "/identification/" + IdUriUtils.encodeUri(thisExternalResource.uri()) +  "/images/updated",
                    updateImages,
                    listenerReadyCallBack
                );
            }
            function updateImages(imagesAsJson){
                var images = Image.arrayFromServerJson(imagesAsJson);
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