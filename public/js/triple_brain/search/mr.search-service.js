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
        api.searchForAllOwnResources = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/own_all_resource/auto_complete"
            });
        };

        api.searchForOwnVerticesAndPublicOnes = function (searchText, successCallback) {
            return api.searchForOwnVerticesAndPublicOnesAjaxCall(
                searchText
            ).then(successCallback);
        };
        api.searchForOwnVerticesOnly = function (searchText, successCallback) {
            return api.searchForOwnVerticesOnly(
                searchText
            ).then(successCallback);
        };
        api.searchForOnlyOwnVerticesAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/own_vertices/auto_complete"
            });
        };
        api.searchOwnTags = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/own_tags/auto_complete"
            });
        };
        api.searchForOnlyOwnTagsAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/own_tags/auto_complete"
            });
        };
        api.searchForOnlyOwnVerticesAndSchemasAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/own_vertices_and_schemas/auto_complete"
            });
        };
        api.searchForOwnVerticesAndPublicOnesAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/vertices/auto_complete"
            });
        };
        api.searchForOwnRelationsAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: UserService.currentUserUri() +
                "/search/relations/auto_complete"
            });
        };
        api.getSearchResultDetails = function (uri, callback) {
            return api.getSearchResultDetailsAjaxCall(
                uri
            ).then(
                callback
            );
        };
        api.getSearchResultDetailsAjaxCall = function (uri) {
            var baseUri = UserService.hasCurrentUser() ?
                UserService.currentUserUri() + "/search/" :
                "/service/search/";
            return $.ajax({
                type: 'GET',
                url: baseUri +
                "details?uri=" + uri
            });
        };
        api.searchForPublicVerticesAndSchemasAjaxCall = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: "/service/search"
            });
        };
        return api;
    }
);
