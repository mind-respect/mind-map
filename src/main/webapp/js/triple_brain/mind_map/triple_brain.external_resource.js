/*
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.external_resource == undefined) {
    (function ($) {
        var freebaseStatic = triple_brain.freebase;
        var externalResourceStatic = triple_brain.external_resource = {};
        externalResourceStatic.withUriAndLabel = function(uri, label){
            return new ExternalResource(
                uri,
                label
            );
        }
        externalResourceStatic.fromFreebaseSuggestion = function(freebaseSuggestion){
            return new ExternalResource(
                freebaseStatic.freebaseIdToURI(
                    freebaseSuggestion.id
                ),
                freebaseSuggestion.name
            )
        }
        externalResourceStatic.fromServerJson = function(serverJson){
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
                return $.toJSON({
                    uri : thisExternalResource.uri(),
                    label : thisExternalResource.label()
                });
            }
            this.setType = function(type){
                thisExternalResource.type = type;
            }
            this.getType = function(){
                return thisExternalResource.type;
            }
        }
    })(jQuery);
}