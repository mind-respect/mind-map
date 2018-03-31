/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "clipboard"
], function ($, Clipboard) {
    "use strict";
    var api = {};
    api.showForList = function (list) {
        var modal = getModal();
        modal.find(".list-content").html(
            list
        );
        modal.modal();
        new Clipboard(
            $("#list-copy-btn")[0], {
                target: function () {
                    return modal.find(".list-content")[0];
                }
            }
        );
    };
    return api;

    function getModal() {
        return $("#list-modal");
    }
});
