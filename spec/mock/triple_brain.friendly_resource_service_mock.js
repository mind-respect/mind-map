/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.friendly_resource_service"
], function (FriendlyResourceService) {
    "use strict";
    var api = {};
    api.applyDefaultMocks = function(){
        var spies = {};
        spies["updateLabel"] = api.updateLabel();
        spies["remove"] = api.remove();
        return spies;
    };
    api.updateLabel = function () {
        return spyOn(FriendlyResourceService, "updateLabel").and.callFake(function (friendlyResource, label, callback) {
            if (callback !== undefined) {
                callback(friendlyResource);
            }
        });
    };
    api.remove = function(){
        return spyOn(FriendlyResourceService, "remove").and.callFake(function (friendlyResource, callback) {
            if (callback !== undefined) {
                callback();
            }
        });
    };
    return api;
});