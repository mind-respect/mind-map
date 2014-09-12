/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        $.fn.setCursorToEndOfText = function () {
            var initialVal = this.val();
            this.val('');
            this.val(initialVal);
        };
    }
);
