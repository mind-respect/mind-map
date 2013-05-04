/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.config",
    "triple_brain.user"
],
    function ($, config, UserService) {
        return {
            search_for_auto_complete:function (searchText, successCallback) {
                $.ajax({
                    type:'GET',
                    url: UserService.currentUserUri() +
                        "/search/vertices/auto_complete/" + searchText
                }).success(successCallback)
            }
        };
    }
);