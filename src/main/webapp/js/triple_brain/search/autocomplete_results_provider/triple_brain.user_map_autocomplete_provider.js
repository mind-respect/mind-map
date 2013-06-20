/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search",
    "triple_brain.user"
], function ($, SearchService, UserService) {
    var api = {};
    api.getFetchMethod = function (searchTerm) {
        return SearchService.searchAjaxCall(
            searchTerm
        );
    };
    api.formatResults = function(searchResults){
        var userName = UserService.authenticatedUserInCache().user_name;
        return $.map(searchResults, function (searchResult) {
            var format = {
                nonFormattedSearchResult: searchResult,
                description:searchResult.note,
                label:searchResult.label,
                value:searchResult.label,
                source:"user " + userName,
                uri:searchResult.id,
                provider:api
            };
            format.somethingToDistinguish = searchResult.relations_name.filter(
                function (relationName) {
                    return relationName !== "";
                }
            ).join(", ");
            format.distinctionType = "relations";
            return format;
        });
    };
    api.getMoreInfoForSearchResult = function (searchResult, callback) {
        callback({
                conciseSearchResult:searchResult,
                title:searchResult.label,
                text: searchResult.nonFormattedSearchResult.note,
                imageUrl:""
            }
        );
    };
    return api;
});