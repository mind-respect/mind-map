/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.bubble_delete_menu"
], function ($, BubbleDeleteMenu) {
    "use strict";
    var api = {};
    api.applyDefaultMocks = function () {
        return {
            'ask': spyOn(BubbleDeleteMenu.DeleteMenu.prototype, 'ask').and.callFake(function () {
                return $.Deferred().resolve();
            })
        };
    };
    return api;
});