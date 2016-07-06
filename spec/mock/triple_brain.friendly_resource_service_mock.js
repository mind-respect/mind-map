/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.friendly_resource_service"
], function (FriendlyResourceService) {
    "use strict";
    var api = {};
    api.updateLabel = function () {
        return spyOn(FriendlyResourceService, "updateLabel").and.callFake(function (friendlyResource, label, callback) {
            if (callback !== undefined) {
                callback(friendlyResource);
            }
        });
    };
    return api;
});