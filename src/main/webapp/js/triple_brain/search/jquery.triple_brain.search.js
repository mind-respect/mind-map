/*
 * Copyright Mozilla Public License 1.1
 */

require([
    "jquery",
    "jquery-ui"
], function ($) {
    $.fn.tripleBrainAutocomplete = function (options) {
        var textInput = this;
        $(textInput).autocomplete($.extend(
            getAutocompleteOptions(),
            options
        )
        ).data("ui-autocomplete")._renderItem = function (ul, item) {
            var listElement = $("<li>");
            var moreInfoContainer = $("<span class='info'>");
            if (item.somethingToDistinguish !== undefined && item.somethingToDistinguish !== "") {
                var distinctionContainer = $("<span class='distinction'>");
                if (item.distinctionType === "relations") {
                    moreInfoContainer.append("-> ")
                }
                distinctionContainer.append(
                    item.somethingToDistinguish
                );
                moreInfoContainer.append(
                    distinctionContainer
                );
            }
            var itemLink = $("<a>");
            itemLink
                .append(item.label + " ")
                .append(moreInfoContainer);
            listElement.append(
                itemLink
            );
            return listElement.appendTo(ul);
        };
        return this;
        function getAutocompleteOptions() {
            return {
                source:function (request, response) {
                    var searchTerm = request.term;
                    if (options.resultsProviders.length === 1) {
                        var singleResultsProvider = options.resultsProviders[0];
                        $.when(
                            singleResultsProvider.getFetchMethod(searchTerm)
                        ).done(function (results) {
                                response(
                                    singleResultsProvider.formatResults(
                                        results
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
                            var results = jQuery.isArray(this) ? this[0] : this;
                            var resultProvider = options.resultsProviders[i];
                            allResults = allResults.concat(
                                resultProvider.formatResults(
                                    results
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
                close:function () {
                    $(".autocomplete-flyout").remove();
                },
                focus:function (event, ui) {
                    var searchResult = ui.item;
                    searchResult.provider.getMoreInfoForSearchResult(
                        searchResult,
                        function (moreInfo) {
                            $(".autocomplete-flyout").remove();
                            displayDescriptionPanel(
                                event.currentTarget,
                                moreInfo
                            );
                        }
                    );
                    function displayDescriptionPanel(list, description) {
                        var moreInfoPanel = $("<div>");
                        moreInfoPanel.addClass("autocomplete-flyout");
                        list = $(list);
                        var image = $("<img src='" + description.imageUrl + "'>");
                        moreInfoPanel.append(
                            image
                        );
                        var title = $("<span class='title'>").append(
                            description.title + " "
                        );
                        var searchResult = description.conciseSearchResult;
                        var sourceContainer = $("<span>");
                        sourceContainer.append(
                            $.t("vertex.search.source") + ": " +
                                searchResult.source
                        );
                        var text = $("<span>").append(
                            description.text + " "
                        );
                        $("body").append(moreInfoPanel.hide());
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
                        var listPosition = $(list).offset();
                        var widthMargin = 20;
                        var rightAlignedPosition = {
                            x:listPosition.left + list.width() + widthMargin,
                            y:listPosition.top
                        };
                        var mostRightPositionInScreen = $(window).width() + $("html,body").scrollLeft();
                        var position;
                        if (rightAlignedPosition.x + moreInfoPanel.width() > mostRightPositionInScreen) {
                            position = {
                                x:listPosition.left - moreInfoPanel.width(),
                                y:listPosition.top
                            }
                        } else {
                            position = rightAlignedPosition;
                        }
                        moreInfoPanel.css("left", position.x);
                        moreInfoPanel.css("top", position.y);
                        moreInfoPanel.show();
                    }
                }
            };
        }
    }
});