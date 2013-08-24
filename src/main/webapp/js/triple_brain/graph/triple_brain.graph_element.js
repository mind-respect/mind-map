/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.id_uri"
], function ($, IdUriUtils) {
    var api = {};
    api.addIdentification = function (graphElement, identification, successCallback) {
        identification.listenForUpdates(addIdentificationWhenListenerReady);
        function addIdentificationWhenListenerReady() {
            var identificationJson = identification.jsonFormat();
            identificationJson.type = identification.type;
            $.ajax({
                type:'POST',
                url:graphElement.getUri() + '/identification',
                data:$.toJSON(identificationJson),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    identification.type === "type" ?
                        graphElement.addType(identification) :
                        graphElement.addSameAs(identification);
                    if (successCallback != undefined) {
                        successCallback.call(
                            this,
                            graphElement,
                            identification
                        );
                    }
                }
            );
        }
    };
    api.removeIdentification = function(graphElement, identification, successCallback){
        $.ajax({
            type:'DELETE',
            url:graphElement.getUri()
                + '/identification/'
                + IdUriUtils.encodeUri(identification.uri())
        }).success(successCallback);
    };
    return api;
});