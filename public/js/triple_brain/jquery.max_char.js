/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "jquery.focus-end"
], function ($) {
    "use strict";
    var defaultMaxChar = 40;
    $.fn.maxChar = function (maxChars) {
        var $this = $(this);
        var text = $this.maxCharCleanText();
        $this.text($.maxCharText(
            text,
            maxChars
        ));
        return $this;
    };
    $.maxCharText = function(text, maxChars){
        if (undefined === maxChars) {
            maxChars = defaultMaxChar;
        }
        var iteration = maxChars,
            lines = [],
            lastIndexOfNewLine = 0;
        for (; lastIndexOfNewLine < text.length;) {
            var line = text.substring(
                lastIndexOfNewLine,
                    lastIndexOfNewLine + maxChars
                ),
                indexOfSpaceInLine = line.lastIndexOf(" ") + 1;
            if (0 === indexOfSpaceInLine && line.length >= maxChars) {
                iteration = maxChars;
            }
            else if (0 === indexOfSpaceInLine || line.length < maxChars) {
                iteration = maxChars;
            } else {
                line = text.substring(
                    lastIndexOfNewLine,
                    lastIndexOfNewLine + indexOfSpaceInLine
                );
                iteration = indexOfSpaceInLine;
            }
            lastIndexOfNewLine += iteration;
            lines.push(
                line
            );
        }
        return lines.join(
            '\n'
        );
    };
    $.fn.maxCharCleanText = function () {
        var $this = $(this);
        return $this.text().replace(
            /\n/g,
            ''
        );
    };
    $.fn.maxCharCleanTextApply = function () {
        this.text(
            this.maxCharCleanText()
        );
        return this;
    };
});
