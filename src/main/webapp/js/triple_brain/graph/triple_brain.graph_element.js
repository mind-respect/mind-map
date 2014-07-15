/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.identification_server_facade"
], function ($, IdentificationServerFacade) {
    var api = {};
    api.addIdentification = function (graphElement, identification, callback) {
        $.ajax({
            type: 'POST',
            url: graphElement.getUri() + '/identification',
            data: identification.getJsonFormat(),
            contentType: 'application/json;charset=utf-8',
            statusCode: {
                201: ajaxCallBack
            }
        });
        function ajaxCallBack(identificationServerFormat) {
            var updatedIdentification = IdentificationServerFacade.fromServerFormat(
                identificationServerFormat
            );
            updatedIdentification.setType(identification.getType());
            switch (identification.getType()) {
                case "type" :
                    graphElement.addType(updatedIdentification);
                    break;
                case "same_as"  :
                    graphElement.addSameAs(updatedIdentification);
                    break;
                default :
                    graphElement.addGenericIdentification(
                        updatedIdentification
                    );
            }
            if (callback != undefined) {
                callback.call(
                    this,
                    graphElement,
                    updatedIdentification
                );
            }
        }
    };
    api.removeIdentification = function (graphElement, identification, successCallback) {
        $.ajax({
            type: 'DELETE',
            url: graphElement.getUri()
                + '/identification?uri=' + identification.getUri()
        }).success(successCallback);
    };
    return api;
});