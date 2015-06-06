/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
],
    function ($, UserService) {
        "use strict";
        var api = {};
        api.searchForOwnVerticesAndPublicOnes = function (searchText, successCallback) {
            api.searchForOwnVerticesAndPublicOnesAjaxCall(
                searchText
            ).success(successCallback);
        };
        api.searchForOwnVerticesOnly = function (searchText, successCallback) {
            api.searchForOwnVerticesOnly(
                searchText
            ).success(successCallback);
        };
        api.searchForOnlyOwnVerticesAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/own_vertices/auto_complete?text=" + searchText
            });
        };
        api.searchForOnlyOwnVerticesAndSchemasAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/own_vertices_and_schemas/auto_complete?text=" + searchText
            });
        };
        api.searchForOwnVerticesAndPublicOnesAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/vertices/auto_complete?text=" + searchText
            });
        };
        api.searchForOwnRelationsAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/relations/auto_complete?text=" + searchText
            });
        };
        api.getSearchResultDetails = function(uri, callback){
            api.getSearchResultDetailsAjaxCall(
                uri
            ).success(
                callback
            );
        };
        api.getSearchResultDetailsAjaxCall = function(uri){
            var baseUri = UserService.hasCurrentUser()?
                UserService.currentUserUri() + "/search/" :
                "/service/search/";
            return $.ajax({
                type:'GET',
                url: baseUri +
                    "details?uri=" + uri
            });
        };
        api.searchForPublicVerticesAndSchemasAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: "/service/search?text=" + searchText
            });
        };
        return api;
    }
);