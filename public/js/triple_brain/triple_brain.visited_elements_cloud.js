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
    var _elements,
        _container;
    return {
        buildFromElementsInContainer: function (elements, container) {
            _elements = elements;
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
        var list = _container.find("ul");
        var index = 0;
        $.each(_elements, function () {
            index++;
            var element = this;
            var span = $("<span class='label'>").text(
                element.getLabel()
            );
            if(index % 2 === 0){
                span.addClass("label-light-blue");
            }
            else {
                span.addClass("label-dark-blue");
            }
            $("<li class=''>").append(
                $("<a>").attr(
                    "tagcloud-weight",
                    element.getNumberOfVisits()
                ).data(
                    "uri",
                    element.getUri()
                ).append(
                    span
                ).click(function (event) {
                        event.preventDefault();
                        window.location = IdUri.htmlUrlForBubbleUri(
                            $(this).data("uri")
                        );
                    }
                )
            ).appendTo(list);
        });
        _container.reattach();
    }
    function setTitle(){
        _container.siblings("h2").text(
            IdUri.currentUsernameInUrl()
        );
    }
});