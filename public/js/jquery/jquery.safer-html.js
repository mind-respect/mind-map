/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function ($) {
        var blacklist = [
            "script",
            "iframe",
            "img"
        ];
        $.fn.saferHtml = function (html) {
            var toSanitize = html === undefined ? this.html() : html;
            return this.html(
                emptyHtmlIfHasMalicious(
                    toSanitize
                )
            );
        };
        function emptyHtmlIfHasMalicious(html) {
            var $html = $("<div>").append(html);
            var isMalicious = false;
            $.each(blacklist, function () {
                if ($html.find(this + "").length > 0) {
                    isMalicious = true;
                    return false;
                }
            });
            return isMalicious ? "" : html;
        }
    }
);
