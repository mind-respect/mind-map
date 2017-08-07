/*
 * Copyright Vincent Blouin under the GPL License version 3
 * forked from https://github.com/sebhildebrandt/reveal.js-tagcloud-plugin
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "jquery.performance"
], function ($, IdUri) {
    "use strict";
    var NUMBER_OF_VISIT_RANKS = 3,
        _elements,
        _container;
    return {
        buildFromElementsInContainer: function (elements, container) {
            _elements = elements;
            defineNumberVisitsRank();
            sortElements();
            _container = container;
            buildHtml();
            setTitle();
        }
    };

    function sortElements() {
        _elements.sort(function (a, b) {
            return a.getLastCenterDate() > b.getLastCenterDate() ?
                -1 : 1;
        });
    }

    function buildHtml() {
        _container.detachTemp();
        var tableBody = _container.find("tbody");
        _elements.forEach(function(element){
            var tr = $("<tr class=''>");
            tr.append(
                buildLabelCellForElement(element),
                buildContextCellForElement(element),
                buildLastVisitCellForElement(element),
                buildNumberVisitsCellForElement(element)
            );
            tr.appendTo(tableBody);
        });
        _container.reattach();
    }

    function buildLabelCellForElement(element){
        return $("<td class='bubble-label'>").append(
            buildAnchorForElement(element).text(
                element.getLabel()
            )
        );
    }

    function buildContextCellForElement(element){
        var anchor = buildAnchorForElement(element);
        var container = $("<div class='grid'>").appendTo(
            anchor
        );
        var contextUris = Object.keys(element.getContext());
        for(var i = 0 ; i < contextUris.length; i++){
            var text = element.getContext()[contextUris[i]];
            container.append(
                $("<div class='grid-item'>").text(
                    text
                )
            );
        }
        return $("<td class='context'>").append(
            anchor
        );
    }

    function buildLastVisitCellForElement(element){
        return $("<td class='last-visit'>").append(
            buildAnchorForElement(element).addClass(
                "text-right"
            ).text(
                element.getLastCenterDate().toLocaleDateString()
            )
        );
    }

    function buildNumberVisitsCellForElement(element){
        var label = $('<span class="label">').addClass(
            getNumberOfVisitsLabelClassFromRank(
                element.getNumberOfVisitsRank()
            )
        ).text(element.getNumberOfVisits());
        return $("<td class='number-visits' >").append(
            buildAnchorForElement(element).addClass(
                "text-right"
            ).append(
                label
            )
        );
    }

    function getNumberOfVisitsLabelClassFromRank(rank){
        switch(rank){
            case 1: return "label-danger";
            case 2 : return "label-warning";
            default : return "label-info";
        }
    }

    function buildAnchorForElement(element){
        return $("<a target='_blank'>").prop(
            "href",
            IdUri.htmlUrlForBubbleUri(
                element.getUri()
            )
        );
    }

    function setTitle() {
        _container.siblings("h2").text(
            IdUri.currentUsernameInUrl()
        );
    }

    function defineNumberVisitsRank(){
        _elements.sort(function (a, b) {
            return a.getNumberOfVisits() > b.getNumberOfVisits() ?
                -1 : 1;
        });

        var amountPerRank = Math.ceil(_elements.length / NUMBER_OF_VISIT_RANKS);
        var currentRankLimit = amountPerRank;
        var currentRank = 1;
        var index = 1;
        _elements.forEach(function(element){
            if(index <= currentRankLimit){
                element.setVisitRank(currentRank);
            }
            if(index === currentRankLimit){
                currentRankLimit += amountPerRank;
                currentRank++;
            }
            index++;
        });
    }
});