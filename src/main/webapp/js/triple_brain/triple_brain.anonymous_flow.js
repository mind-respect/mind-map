/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.big_search_box"
], function ($, BigSearchBox) {
    "use strict";
    var api = {};
    api.enter = function(){
        $("body").removeClass("hidden");
        BigSearchBox.show();
    };
    return api;
});