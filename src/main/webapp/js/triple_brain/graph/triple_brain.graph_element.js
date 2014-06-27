/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.identification_server_update_handler"
], function ($, IdentificationUpdateHandler) {
    var api = {};
    api.addIdentification = function (graphElement, identification, successCallback) {
        IdentificationUpdateHandler.forFriendlyResource(identification).listenForUpdates(
            addIdentificationWhenListenerReady
        );
        function addIdentificationWhenListenerReady() {
            $.ajax({
                type:'POST',
                url:graphElement.getUri() + '/identification',
                data:identification.getJsonFormat(),
                contentType:'application/json;charset=utf-8'
            }).success(function () {
                    switch (identification.getType()) {
                        case "type" :
                            graphElement.addType(identification);
                            break;
                        case "same_as"  :
                            graphElement.addSameAs(identification);
                            break;
                        default :
                            graphElement.addGenericIdentification(
                                identification
                            );
                    }
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
    api.removeIdentification = function (graphElement, identification, successCallback) {
        $.ajax({
            type:'DELETE',
            url:graphElement.getUri()
                + '/identification?uri=' + identification.uri()
        }).success(successCallback);
    };
    return api;
});