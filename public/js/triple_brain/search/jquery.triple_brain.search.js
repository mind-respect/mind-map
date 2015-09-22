/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "jquery-ui"
], function ($) {
    "use strict";
    var enterKeyCode = 13,
        api = {},
        detailsCache = {};
    $.fn.tripleBrainAutocomplete = function (options) {
        var textInput = $(this);
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
                    $(this).trigger("autocompleteselect");
                }
            });
        return this;
        function getAutocompleteOptions() {
            return {
                source: function (request, response) {
                    var searchTerm = request.term;
                    if (options.resultsProviders.length === 1) {
                        var singleResultsProvider = options.resultsProviders[0];
                        $.when(
                            singleResultsProvider.getFetchMethod(searchTerm)
                        ).done(function (results) {
                                response(
                                    singleResultsProvider.formatResults(
                                        results,
                                        searchTerm
                                    )
                                );
                            });
                    } else {
                        $.when.apply(
                            $,
                            makeFetchMethodsArray()
                        ).done(gatherAndReturnResults);
                    }
                    function gatherAndReturnResults() {
                        var allResults = [],
                            i = 0;
                        $.each(arguments, function () {
                            var results = $.isArray(this) ? this[0] : this;
                            var resultProvider = options.resultsProviders[i];
                            allResults = allResults.concat(
                                resultProvider.formatResults(
                                    results,
                                    searchTerm
                                )
                            );
                            i++;
                        });
                        response(allResults);
                    }

                    function makeFetchMethodsArray() {
                        var fetchMethods = [];
                        $.each(options.resultsProviders, function () {
                            var provider = this;
                            fetchMethods.push(
                                provider.getFetchMethod(searchTerm)
                            );
                        });
                        return fetchMethods;
                    }
                },
                change: function () {
                    removeSearchFlyout();
                },
                close: function () {
                    removeSearchFlyout();
                },
                focus: function (event, ui) {
                    api._onFocusAction(
                        ui.item,
                        $(event.currentTarget)
                    );
                }
            };
        }

        function renderItemCustom(ul, item) {
            var listElement = $("<li>"),
                moreInfoContainer = $("<div class='info'>"),
                labelContainer = $("<span class='element-label'>").append(
                    item.label + " "
                );
            if (item.elementType !== undefined && item.elementType !== "") {
                $("<span class='type'>").append(
                    item.elementType
                ).appendTo(moreInfoContainer);
            }
            if (item.somethingToDistinguish !== undefined && item.somethingToDistinguish !== "") {
                $("<div class='distinction'>").append(
                    item.somethingToDistinguish
                ).appendTo(moreInfoContainer);
            }
            $("<a>").append(
                labelContainer,
                moreInfoContainer
            ).appendTo(listElement);
            return listElement.appendTo(ul);
        }
    };
    api._onFocusAction = function (searchResult, resultsList) {
        if (api.hasCachedDetailsForSearchResult(searchResult)) {
            displayDescriptionPanel(
                api.getCachedDetailsOfSearchResult(
                    searchResult
                )
            );
            return;
        }
        searchResult.provider.getMoreInfoForSearchResult(
            searchResult,
            function (moreInfo) {
                detailsCache[searchResult.uri] = moreInfo;
                displayDescriptionPanel(moreInfo);
            }
        );
        function displayDescriptionPanel(description) {
            removeSearchFlyout();
            if(!resultsList.is(":visible")){
                return;
            }
            var moreInfoPanel = $("<div class='hidden'>");
            moreInfoPanel.addClass("autocomplete-flyout");
            if (description.image !== undefined) {
                var image = $(
                    "<img src='" +
                    description.image.getBase64ForSmall() +
                    "'>"
                );
                moreInfoPanel.append(
                    image
                );
            }
            var title = $("<span class='title'>").append(
                description.title + " "
            );
            var searchResult = description.conciseSearchResult;
            var sourceContainer = $("<span>");
            sourceContainer.append(
                $.t("vertex.search.source") + ": " +
                searchResult.source
            );
            var text = $("<div class='description'>").append(
                description.text,
                " "
            );
            $("body").append(moreInfoPanel);
            moreInfoPanel.append(
                title,
                "<br/>",
                sourceContainer,
                "<br/>"
            );
            if (description.source !== undefined) {
                var descriptionSource = $("<span class='source'>").append(
                    "[" + description.source + "] "
                );
                moreInfoPanel.append(descriptionSource);
            }
            moreInfoPanel.append(text);
            var listPosition = resultsList.offset();
            var widthMargin = 20;
            var rightAlignedPosition = {
                x: listPosition.left + resultsList.width() + widthMargin,
                y: listPosition.top
            };
            var mostRightPositionInScreen = $(window).width() + $("html,body").scrollLeft();
            var position;
            if (rightAlignedPosition.x + moreInfoPanel.width() > mostRightPositionInScreen) {
                position = {
                    x: listPosition.left - moreInfoPanel.width(),
                    y: listPosition.top
                };
            } else {
                position = rightAlignedPosition;
            }
            moreInfoPanel.css("left", position.x);
            moreInfoPanel.css("top", position.y);
            moreInfoPanel.removeClass("hidden");
        }
    };
    api.hasCachedDetailsForSearchResult = function (searchResult) {
        return detailsCache[searchResult.uri] !== undefined;
    };
    api.getCachedDetailsOfSearchResult = function (searchResult) {
        return detailsCache[searchResult.uri];
    };
    return api;
    function removeSearchFlyout() {
        $(".autocomplete-flyout").remove();
    }
});