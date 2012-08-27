/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery"
],
    function (require, $) {
        var api = {};
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
                freebaseSuggestion.name
            )
        }
        api.fromServerJson = function(serverJson){
            return new ExternalResource(
                serverJson.uri,
                serverJson.label
            )
        }

        function ExternalResource(uri, label) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            }
            this.label = function () {
                return label;
            }
            this.serverFormat = function(){
                return $.toJSON(
                    thisExternalResource.jsonFormat()
                );
            }
            this.jsonFormat = function(){
                return {
                    uri : thisExternalResource.uri(),
                    label : thisExternalResource.label()
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