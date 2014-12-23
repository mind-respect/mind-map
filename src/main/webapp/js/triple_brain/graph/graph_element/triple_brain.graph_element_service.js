/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, Identification, EventBus) {
    var api = {},
        identificationBaseEventBusKey = "/event/ui/graph/identification/";
    api.addSameAs = function (graphElement, sameAs, callback) {
        sameAs.setType("same_as");
        api.addIdentification(graphElement, sameAs, callback);
    };
    api.addType = function (graphElement, type, callback) {
        type.setType("type");
        api.addIdentification(graphElement, type, callback);
    };
    api.addGenericIdentification = function (graphElement, genericIdentification, callback) {
        genericIdentification.setType("generic");
        api.addIdentification(graphElement, genericIdentification, callback);
    };
    api.addIdentification = function (graphElement, identification, callback) {
        EventBus.executeAfterForEvent(
            '/event/ui/graph/before/identification/added',
            add,
            [graphElement, identification]
        );
        function add(){
            $.ajax({
                type: 'POST',
                url: graphElement.getUri() + '/identification',
                data: identification.getJsonFormat(),
                contentType: 'application/json;charset=utf-8',
                statusCode: {
                    201: ajaxCallBack
                }
            });
        }
        function ajaxCallBack(identificationServerFormat) {
            var updatedIdentification = Identification.fromServerFormat(
                identificationServerFormat
            );
            updatedIdentification.setType(identification.getType());
            var addAction = updatedIdentification.rightActionForType(
                graphElement.addType,
                graphElement.addSameAs,
                graphElement.addGenericIdentification
            );
            addAction.call(
                graphElement,
                updatedIdentification
            );
            if (callback !== undefined) {
                callback.call(
                    this,
                    graphElement,
                    updatedIdentification
                );
            }
            var eventBusKey = identificationBaseEventBusKey + "added";
            EventBus.publish(
                eventBusKey,
                [graphElement, updatedIdentification]
            );
        }
    };
    api.removeIdentification = function (graphElement, identification, callback) {
        $.ajax({
            type: 'DELETE',
            url: graphElement.getUri()
                + '/identification?uri=' + identification.getUri()
        }).success(function () {
            var removeAction = identification.rightActionForType(
                graphElement.removeType,
                graphElement.removeSameAs,
                graphElement.removeGenericIdentification
            );
            removeAction.call(
                graphElement,
                identification
            );
            if (callback !== undefined) {
                callback(
                    graphElement,
                    identification
                );
            }
            var eventBusKey = identificationBaseEventBusKey + "removed";
            EventBus.publish(
                eventBusKey,
                [graphElement, identification]
            );
        });
    };
    api.addImageToIdentification = function (vertex, identification, image) {
        $.ajax({
            type: 'POST',
            url: vertex.getUri() + '/identification/image?uri=' + identification.getUri(),
            data: $.toJSON([image.jsonFormat()]),
            contentType: 'application/json;charset=utf-8'
        }).success(function () {
            identification.addImage(image);
            vertex.addImages([image]);
            vertex.refreshImages();
        });
    };
    api.setDescriptionToIdentification = function (vertex, identification, description) {
        $.ajax({
            type: 'PUT',
            url: vertex.getUri() + '/identification/description?uri=' + identification.getUri(),
            data: description,
            contentType: "text/plain"
        }).success(function () {
            identification.setComment(description);
        });
    };
    return api;
});