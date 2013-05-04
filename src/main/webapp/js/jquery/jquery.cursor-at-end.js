/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        $.fn.setCursorToTextEnd = function () {
            var initialVal = this.val();
            this.val('');
            this.val(initialVal);
        };
    }
);
