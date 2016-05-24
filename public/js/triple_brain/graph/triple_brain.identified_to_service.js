/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "triple_brain.search_result"
], function ($, UserService, SearchResult) {
    "use strict";
    var api = {};
    api.getForIdentification = function (identification) {
        var deferred = $.Deferred();
        $.ajax({
            type: 'GET',
            url: getBaseUri() + encodeURIComponent(identification.getExternalResourceUri())
        }).success(function(searchResultsServerFormat){
            deferred.resolve(
                SearchResult.fromServerFormatArray(
                    searchResultsServerFormat
                )
            );
        });
        return deferred.promise();
    };
    return api;
    function getBaseUri() {
        return UserService.currentUserUri() + "/identification/";
    }
});