/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_ui",
    "triple_brain.event_bus"
], function ($, GraphUi, EventBus) {
    "use strict";
    var enterKeyCode = 13,
        api = {},
        detailsCache = {},
        referencesText;
    $.fn.tripleBrainAutocomplete = function (options) {
        var textInput = $(this);
        return textInput;
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
                    options.resultsProviders.forEach(function (provider) {
                        if(!provider.isActive()){
                            return;
                        }
                        providerPromises.push(
                            getResultsOfProvider(
                                provider
                            )
                        );
                    });
                    $.when.apply(
                        $, providerPromises
                    ).then(function () {
                        response(searchResults);
                    });
                    function getResultsOfProvider(provider){
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
            if (item.nbReferences !== undefined && item.nbReferences > 0) {
                $("<div class='nb-references'>").append(
                    item.nbReferences + referencesText
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
            if (!resultsList.is(":visible")) {
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

    EventBus.subscribe("localized-text-loaded", function () {
        referencesText = $.t("search.references");
    });

    return api;
    function removeSearchFlyout() {
        $(".autocomplete-flyout").remove();
    }
});