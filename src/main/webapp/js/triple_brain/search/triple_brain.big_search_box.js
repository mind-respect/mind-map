/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_map_autocomplete_provider",
    "jquery.triple_brain.search"
], function ($, UserMapAutocompleteProvider) {
    "use strict";
    var api = {};
    api.show = function(){
        getBoxContainer().removeClass("hidden").find(
            "input"
        ).tripleBrainAutocomplete({
            select : function(event, ui){
                var uri = ui.item.uri;
                window.location = "?bubble=" + uri;
            },
            resultsProviders : [
                UserMapAutocompleteProvider.toFetchPublicResources()
            ]
        });

    };
    return api;
    function getBoxContainer(){
        return $("#big-search-box-container");
    }
});