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
            return this.html(
                emptyHtmlIfHasMalicious(
                    html
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