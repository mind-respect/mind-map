/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery"
], function ($) {
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
                    switch (identification.type) {
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