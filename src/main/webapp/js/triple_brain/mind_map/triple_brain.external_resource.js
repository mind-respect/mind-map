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
        function ExternalResource(uri, label) {
            var thisExternalResource = this;
            this.uri = function () {
                return uri;
            }
            this.label = function () {
                return label;
            }
            this.serverFormat = function(){
                return {
                    uri : thisExternalResource.uri(),
                    label : thisExternalResource.label()
                }
            }
        }
    })(jQuery);
}