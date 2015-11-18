/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, Identification, EventBus) {
    "use strict";
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
        function add() {
            $.ajax({
                type: 'POST',
                url: graphElement.getUri() + '/identification',
                data: identification.getJsonFormat(),
                contentType: 'application/json;charset=utf-8'
            }).success(function(serverIdentifications){
                api._addIdentificationsCallback(
                    graphElement,
                    identification,
                    serverIdentifications,
                    callback
                );
            });
        }
    };
    api._addIdentificationsCallback = function (graphElement, identification, serverIdentifications, callback) {
        var identifications = Identification.fromMultipleServerFormat(
            serverIdentifications,
            identification.getType()
        );
        $.each(identifications, function(){
            var identification = this;
            var addAction = identification.rightActionForType(
                graphElement.addType,
                graphElement.addSameAs,
                graphElement.addGenericIdentification
            );
            addAction.call(
                graphElement,
                identification
            );
        });

        if (callback !== undefined) {
            callback.call(
                this,
                graphElement,
                identifications
            );
        }

        $.each(identifications, function(){
            var identification = this;
            EventBus.publish(
                identificationBaseEventBusKey + "added",
                [graphElement, identification]
            );
        });
    };
    api.removeIdentification = function (graphElement, identification, callback) {
        $.ajax({
            type: 'DELETE',
            url: graphElement.getUri() + '/identification?uri=' + identification.getUri()
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