/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([], function () {
    "use strict";
    var api = {
        "PRIVATE": "PRIVATE",
        "FRIENDS": "FRIENDS",
        "PUBLIC_WITH_LINK": "PUBLIC_WITH_LINK",
        "PUBLIC": "PUBLIC"
    };
    api.isPublic = function (shareLevel) {
        return shareLevel === api.PUBLIC || shareLevel === api.PUBLIC_WITH_LINK;
    };
    return api;
});
