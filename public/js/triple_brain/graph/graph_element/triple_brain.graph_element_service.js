/*
 * Copyright Vincent Blouin under the GPL License version 3
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
                    201: function(serverIdentification){
                        api._addIdentificationCallback(
                            graphElement,
                            identification,
                            serverIdentification,
                            callback
                        )
                    }
                }
            });
        }
    };
    api._addIdentificationCallback = function(graphElement, identification, serverIdentification, callback){
        var updatedIdentification = Identification.fromServerFormat(
            serverIdentification
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
        EventBus.publish(
            identificationBaseEventBusKey + "added",
            [graphElement, updatedIdentification]
        );
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
    return api;
});