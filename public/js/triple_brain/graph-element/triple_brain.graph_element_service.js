/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function ($, Identification, EventBus) {
    "use strict";
    var api = {};
    api.addIdentification = function (graphElement, identification) {
        return EventBus.executeAfterEvent(
            '/event/ui/graph/before/identification/added',
            add,
            [graphElement, identification]
        );
        function add() {
            var deferred = $.Deferred();
            $.ajax({
                type: 'POST',
                url: graphElement.getUri() + '/identification',
                data: identification.getJsonFormat(),
                contentType: 'application/json;charset=utf-8'
            }).then(function (serverIdentifications) {
                deferred.resolve(
                    Identification.fromMultipleServerFormat(
                        serverIdentifications,
                        identification.getRelationExternalResourceUri()
                    )
                );
            });
            return deferred.promise();
        }
    };
    api.removeIdentifier = function (graphElement, identification) {
        return $.ajax({
            type: 'DELETE',
            url: graphElement.getUri() + '/identification?uri=' + identification.getUri()
        });
    };
    api.updateNote = function (graphElement, note, callback) {
        $.ajax({
            type: 'POST',
            url: graphElement.getUri() + '/comment',
            data: note,
            contentType: "text/plain"
        }).success(function () {
            graphElement.setNote(note);
            EventBus.publish(
                '/event/ui/graph/element/note/updated',
                graphElement
            );
            if (callback !== undefined) {
                callback(graphElement);
            }
        });
    };
    api.changeSortDate = function (graphElement) {
        return $.ajax({
            type: 'PUT',
            url: graphElement.getUri() + "/sort",
            data: JSON.stringify({
                sortDate: graphElement.getSortDate().getTime(),
                moveDate: graphElement.getMoveDate().getTime()
            }),
            contentType: 'application/json;charset=utf-8'
        });
    };
    return api;
});