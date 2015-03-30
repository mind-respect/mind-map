/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.user_map_autocomplete_provider",
    "jquery.triple_brain.search"
], function (UserMapAutocompleteProvider) {
    "use strict";
    var api = {};
    api.show = function(){
        getBox().tripleBrainAutocomplete({
            select : function(u){
                debugger;
            },
            resultsProviders : [
                UserMapAutocompleteProvider.toFetchPublicResources()
            ]
        }).removeClass("hidden");
    };
    return api;

    function getBox(){
        return $("#big-search-box");
    }
});