/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.big_search_box",
    "triple_brain.language_manager"
], function ($, BigSearchBox, LanguageManager) {
    "use strict";
    var api = {};
    api.enter = function(){
        LanguageManager.loadLocaleContent(function(){
            $("html").i18n();
            BigSearchBox.show();
            $("body").removeClass("hidden");

        });
    };
    return api;
});