/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.identification_menu"
], function (IdentificationMenu) {
    "use strict";
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {};
    api.forSingle = function () {
        return forSingle;
    };
    forSingleNotOwned.identify = forSingle.identify = function (event, property) {
        event.stopPropagation();
        IdentificationMenu.ofGraphElement(
            property
        ).create();
    };
    return api;
});