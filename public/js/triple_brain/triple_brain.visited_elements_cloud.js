/*
 * Copyright Vincent Blouin under the GPL License version 3
 * forked from https://github.com/sebhildebrandt/reveal.js-tagcloud-plugin
 */

define([
    "jquery",
    "jquery.performance"
], function ($) {
    "use strict";
    var _elements,
        _container;
    return {
        buildFromElementsInContainer: function (elements, container) {
            _elements = elements;
            _container = container;
            buildHtml();
            setupCloud();
        }
    };
    function setupCloud() {
// Find all tagcloud items with a weight defined and add them to this array
        _container = _container[0];
        var weights = [].slice.call(_container.querySelectorAll('[tagcloud-weight]'))
            .map(function (el) {
                return el.getAttribute('tagcloud-weight');
            })
            .sort(function (a, b) {
                return b - a;
            }); // Sort descending

        var upperBound = weights[0];
        var lowerBound = weights[weights.length - 1];
        var denominator = upperBound - lowerBound;
        var slideNotes = _container.querySelectorAll('.notes');
        var isBlackWhite = _container.hasAttribute('bw');

        /**
         * Parses the text, removing any notes and formats each node with a span if one
         * doesn't exist
         *
         * @param text {String} the text of the slide
         * @returns {String} the formatted slide content
         **/
        //function formatTags(text) {
        //    for (var index = 0; index < slideNotes.length; ++index) {
        //        text = text.replace(slideNotes[index].textContent, '');
        //    }
        //
        //    return text.split(/\n/)
        //        .filter(function (item) {
        //            return item.trim() !== '';
        //        })
        //        .map(function (item) {
        //            return ( item.indexOf('span') === -1 ) ? '<span>' + item.trim() + '</span> ' : item.trim();
        //        })
        //        .join('');
        //}

        /**
         * Calculates the size of the element.
         * If one or more of the tags has a weight attribute, all sizes are based on weights.
         * If none of the elements have weights, the sizes are random.
         *
         * @param {DOM Element} the tag to calculate the size of.
         * @return {Number} the percentage to set the font size to
         **/
        function calcSize(elem) {
            var prctnge;

            // At least one of our cloud items is weighted, base sizes around weights
            if (weights.length > 0) {
                var itemWeight = elem.getAttribute('tagcloud-weight') || 0;
                var numerator = itemWeight - lowerBound;
                prctnge = (numerator / denominator) * 150 + 50;
            }
            // None of the cloud items are weighted, base the size randomly
            else {
                prctnge = Math.random() * 150 + 50;
            }

            if (_container.hasAttribute('large')) {
                prctnge = prctnge * 1.2;
            }

            return prctnge;
        }

        /**
         * Applies a color to the tag.
         * If one or more tags have a weight attribute, colors are more intense
         * based on the weight. Otherwise colors, are chosen randomly.
         *
         * @param {DOM Element} the tag to color.
         **/
        function tagColor(elem, isBlackWhite) {
            var color;

            if (isBlackWhite) {
                var col = Math.round(Math.random() * 155 + 100);
                color = 'rgb(' + col + ',' + col + ',' + col + ')';
            } else {
                color = 'hsl(' + Math.random() * 360 + ', 40%, 50%)';
            }

            return color;
        }

        // Replace the inner html of the slide with the formatted tags
        //_container.innerHTML = formatTags(_container.innerHTML);

        // Append the slideNotes to the slide again
        for (var index = 0; index < slideNotes.length; ++index) {
            _container.appendChild(slideNotes[index]);
        }

        // Size and colour the cloud tags
        [].forEach.call(_container.querySelectorAll('span'), function (elem) {
            elem.style.fontSize = calcSize(elem) + '%';
            elem.style.color = tagColor(elem, isBlackWhite);
            elem.classList.add('clouditem');
        });
    }

    function buildHtml() {
        _container.detachTemp();
        $.each(_elements, function () {
            var element = this;
            var span = $("<span>").attr(
                "tagcloud-weight",
                element.getNumberOfVisits()
            ).data(
                "uri",
                element.getUri()
            ).text(
                element.getLabel()
            ).click(function (event) {
                    event.preventDefault();
                    window.location = "?bubble=" + $(this).data("uri")
                }).appendTo(_container);
        });
        _container.reattach();
    }
});