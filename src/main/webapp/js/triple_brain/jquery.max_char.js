/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "jquery.focus-end"
], function ($) {
    "use strict";
    var defaultMaxChar = 50;
    $.fn.maxChar = function (maxChars) {
        var $this = $(this);
        if (undefined === maxChars) {
            maxChars = defaultMaxChar;
        }
        var iteration = maxChars,
            text = $this.maxCharCleanText(),
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
        $this.text(lines.join(
            '\n'
        ));
        return $this;
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
