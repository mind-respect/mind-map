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
        $.each(_elements, function () {
            var element = this;
            $("<li class=''>").append(
                $("<a>").attr(
                    "tagcloud-weight",
                    element.getNumberOfVisits()
                ).data(
                    "uri",
                    element.getUri()
                ).append(
                    $("<span class='label label-primary'>").text(
                        element.getLabel()
                    )
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