/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.flow",
    "triple_brain.language_manager"
], function ($, Flow, LanguageManager) {
    "use strict";
    var api = {};
    api.enter = function () {
        Flow.hideAllFlowSpecificHtml();
        LanguageManager.loadLocaleContent(function () {
            $("html").i18n();
            getContainer().removeClass("hidden");
            $("body").removeClass("hidden");
        });
    };
    return api;
    function getContainer(){
        return $("#schemas-container");
    }
});