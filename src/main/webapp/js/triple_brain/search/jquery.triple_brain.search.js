/*
 * Copyright Mozilla Public License 1.1
 */

require([
    "jquery",
    "jquery-ui"
], function ($) {
    $.fn.tripleBrainAutocomplete = function (options) {
        var textInput = $(this);
        setupNbRequestsIfApplicable();
        textInput.autocomplete($.extend(
            getAutocompleteOptions(),
            options
        )
        ).data("ui-autocomplete")._renderItem = renderItemCustom;
        textInput.on(
            "autocompleteselect",
            function() {
                removeSearchFlyout();
            }
        );
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
                change : function(){
                    removeSearchFlyout();
                },
                close:function () {
                    removeSearchFlyout();
                },
                focus:function (event, ui) {
                    var searchResult = ui.item;
                    searchResult.provider.getMoreInfoForSearchResult(
                        searchResult,
                        function (moreInfo) {
                            removeSearchFlyout();
                            displayDescriptionPanel(
                                event.currentTarget,
                                moreInfo
                            );
                        }
                    );
                    function displayDescriptionPanel(list, description) {
                        removeSearchFlyout();
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

        function setupNbRequestsIfApplicable(){
            if(!options.limitNbRequests){
                return;
            }
            textInput.on(
                "change",
                function(){
                    resetInputData($(this));
                }
            );
            textInput.on(
                "autocompletecreate",
                function(){
                resetInputData($(this));
                }
            );
            textInput.on(
                "autocompletecreate",
                function(){
                resetInputData($(this));
                }
            );
            textInput.on(
                "autocompletesearch",
                function(){
                    var input = $(this);
                    if(isSearchDisabled(input)){
                        input.autocomplete("option", "disabled", true);
                    }
                    addOneRequest(input);
                }
            );
        }

        function resetInputData(input){
            input.autocomplete("option", "disabled", false);
            setNbRequests(
                input,
                0
            );
        }
        function addOneRequest(input){
            setNbRequests(
                input,
                getNbRequests(input) + 1
            );
        }
        function isSearchDisabled(input){
            return getNbRequests(input) >= 4;
        }
        function setNbRequests(input, nbRequests){
            input.data(
                "jquery.triple_brain.search.nbRequests",
                nbRequests
            );
        }
        function getNbRequests(input){
            return input.data(
                "jquery.triple_brain.search.nbRequests"
            );
        }

        function renderItemCustom(ul, item) {
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
        }

        function removeSearchFlyout(){
            $(".autocomplete-flyout").remove();
        }
    }
});