/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.config"
],
    function ($, config) {
        return {
            search_for_auto_complete:function (searchText, successCallback) {
                $.ajax({
                    type:'GET',
                    url:config.links.app + '/service/search/vertices/auto_complete/' + searchText
                }).success(successCallback)
            }
        };
    }
);