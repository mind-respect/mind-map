/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.config",
    "triple_brain.user"
],
    function ($, config, UserService) {
        var api = {};
        api.searchAutoComplete = function (searchText, successCallback) {
            api.searchAjaxCall(
                searchText
            ).success(successCallback);
        };
        api.searchAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/vertices/auto_complete/" + searchText
            });
        };
        return api;
    }
);