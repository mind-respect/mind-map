/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "jquery-ui"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.enter = function () {
        setupAutocomplete();
        return $.Deferred().resolve();
    };
    return api;

    function setupAutocomplete() {
        getSearchInput().autocomplete({
            source: function (request, response) {
                var searchTerm = request.term;
                var searchResults = [];
                UserService.search(searchTerm).then(function (users) {
                    users.forEach(function (user) {
                        searchResults.push(
                            {label: user.username, value: user.username, user: user}
                        );
                    });
                    response(searchResults);
                });
            },
            classes: {
                "ui-autocomplete": "list-group"
            },
            select: function(event, ui){
                window.location = "/user/" + ui.item.user.username;
            }
        }).data("ui-autocomplete")._renderItem = renderItemCustom;
    }

    function getSearchInput() {
        return $("#search-friends");
    }

    function renderItemCustom(ul, item) {
        var icon;
        // if(IdUri.isVertexUri(item.uri)){icon = "fa-circle-o";}
        // else if (IdUri.isMetaUri(item.uri)){icon = "fa-tag";}
        // else if (IdUri.isEdgeUri(item.uri)){icon = "fa-arrows-h";}
        // else {icon = "fa-wikipedia-w";}

        var listElement = $("<li class='list-group-item autocomplete-element'>").append(
            $("<i class='fa pull-right'>").addClass(icon),
            $("<strong class='list-group-item-heading'>").append(item.label),
            $("<p class='list-group-item-text'>").append(item.somethingToDistinguish)
        ).uniqueId();
        listElement.data("searchResult", item);
        return listElement.appendTo(ul);
    }
});
