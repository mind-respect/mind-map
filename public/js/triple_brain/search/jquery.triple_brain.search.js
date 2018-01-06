/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_ui",
    "triple_brain.event_bus",
    "triple_brain.id_uri",
    "triple_brain.bubble_factory",
    "jquery-ui"
], function ($, GraphUi, EventBus, IdUri, BubbleFactory) {
    "use strict";
    var enterKeyCode = 13,
        upArrowKeyCode = 38,
        downArrowKeyCode = 40,
        api = {},
        detailsCache = {},
        referencesText;
    $.fn.mrAutocomplete = function (options) {
        var textInput = $(this);
        textInput.data("mrAutocomplete", true);
        textInput.on("keydown", function(event) {
            var input = $(this);
            if (!input.is(":focus")) {
                return;
            }
            if(input.is("textarea") || input.is("[contenteditable]")){
                /*
                 unfortunately we need to disable traversing autocomplete
                 suggestions with up and down arrow keys when using textarea or contenteditable
                 because otherwise we can't use up and down keys to change the line
                 of the caret position.
                 */
                if([downArrowKeyCode, upArrowKeyCode].indexOf(event.which) !== -1){
                    event.stopImmediatePropagation();
                }
                /*
                * We could use other keys and change event.which to up or down to
                * keep the same feature but with a different key. I tried with page
                * up and page down but it caused other problems I could not avoid without
                * creating other problems.
                *
                * if(pageDownKeyCode === event.which){
                 event.which = downArrowKeyCode;
                 }
                 if(pageUpKeyCode === event.which){
                 event.which = upArrowKeyCode;
                 event.stopPropagation();
                 event.preventDefault();
                 }
                */
            }
        });
        textInput.autocomplete(
            $.extend(
                getAutocompleteOptions(),
                options
            )
        ).data("ui-autocomplete")._renderItem = renderItemCustom;
        textInput.on(
            "autocompleteselect",
            function () {
                removeSearchFlyout();
                $(this).blur();
            }
        ).on(
            "blur",
            removeSearchFlyout
        ).on("keydown.autocomplete", function (event) {
            if (enterKeyCode === event.keyCode) {
                if (GraphUi.hasSelectedFromAutocomplete()) {
                    $(this).trigger("autocompleteselect");
                }
            }
        });
        return this;
        function getAutocompleteOptions() {
            return {
                source: function (request, response) {
                    var searchTerm = request.term;
                    var searchResults = [];
                    var providerPromises = [];
                    var bubble = BubbleFactory.fromSubHtml(
                        this.element
                    );
                    options.resultsProviders.forEach(function (provider) {
                        if (!provider.isActive(bubble)) {
                            return;
                        }
                        providerPromises.push(
                            getResultsOfProvider(
                                provider
                            )
                        );
                    }.bind(this));
                    $.when.apply(
                        $, providerPromises
                    ).then(function () {
                        response(searchResults);
                    });
                    function getResultsOfProvider(provider) {
                        return provider.getFetchMethod(
                            searchTerm
                        ).then(function (results) {
                            searchResults = searchResults.concat(
                                provider.formatResults(
                                    results,
                                    searchTerm
                                )
                            );
                        });
                    }
                },
                classes: {
                    "ui-autocomplete": "list-group"
                },
                change: function () {
                    removeSearchFlyout();
                },
                close: function () {
                    removeSearchFlyout();
                },
                focus: function (event, ui) {
                    var menu = $(this).data("uiAutocomplete").menu.element;
                    menu.find("li").removeClass("focus");
                    var focused = menu.find("li:has(.ui-state-active)");
                    focused.addClass("focus");
                    api._onFocusAction(
                        ui.item,
                        focused
                    );
                }
            };
        }

        function renderItemCustom(ul, item) {
            var icon;
            if(IdUri.isVertexUri(item.uri)){icon = "fa-circle-o";}
            else if (IdUri.isMetaUri(item.uri)){icon = "fa-tag";}
            else if (IdUri.isEdgeUri(item.uri)){icon = "fa-arrows-h";}
            else {icon = "fa-wikipedia-w";}

            var listElement = $("<li class='list-group-item autocomplete-element'>").append(
                $("<i class='fa pull-right'>").addClass(icon),
                $("<strong class='list-group-item-heading'>").append(item.label),
                $("<p class='list-group-item-text'>").append(item.somethingToDistinguish)
            ).uniqueId();
            listElement.data("searchResult", item);
            listElement.popover({
                animation:false,
                html: true,
                placement:'auto left',
                container:'body',
                trigger: "manual",
                content: function () {
                    return buildDescriptionPanelHtml(
                        api.getCachedDetailsOfSearchResult(
                            $(this).data("searchResult")
                        )
                    );
                }
            });
            return listElement.appendTo(ul);
        }
    };
    $.fn.isMrAutocompleteSetup = function () {
        return $(this).data("mrAutocomplete") === true;
    };
    api._onFocusAction = function (searchResult, listElement) {
        $('.autocomplete-element:not(#'+listElement.prop("id") +')').popover('hide');
        var getMoreInfoPromise = api.hasCachedDetailsForSearchResult(searchResult) ?
            $.Deferred().resolve(api.getCachedDetailsOfSearchResult(searchResult)) :
            searchResult.provider.getMoreInfoForSearchResult(searchResult);
        getMoreInfoPromise.then(function (moreInfo) {
            detailsCache[searchResult.uri] = moreInfo;
            listElement.popover("show");
        });
    };
    api.hasCachedDetailsForSearchResult = function (searchResult) {
        return detailsCache[searchResult.uri] !== undefined;
    };
    api.getCachedDetailsOfSearchResult = function (searchResult) {
        return detailsCache[searchResult.uri];
    };

    EventBus.subscribe("localized-text-loaded", function () {
        referencesText = $.t("search.references");
    });

    return api;
    function removeSearchFlyout() {
        $('.autocomplete-element').popover('hide');
    }

    function buildDescriptionPanelHtml(description) {
        var container = $("#search-popover");
        var imgContainer = container.find(".img").empty();
        if (description.image) {
            imgContainer.append(
                $(
                    "<img src='" +
                    description.image.getBase64ForSmall() +
                    "'>"
                )
            );
        }
        var searchResult = description.conciseSearchResult;
        container.find(".source").html(searchResult.source);
        container.find(".description").html(description.comment);
        return container.html();
    }
});