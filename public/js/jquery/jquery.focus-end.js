/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
],
    function ($) {
        $.fn.focusEnd = function() {
            var $this = $(this);
            $this.focus();
            if($this.is("input")){
                var initialVal = this.val();
                this.val('');
                this.val(initialVal);
                return;
            }
            //http://stackoverflow.com/questions/1181700/set-cursor-position-on-contenteditable-div
            var tmp = $('<span />').appendTo($this),
                node = tmp.get(0),
                range = null,
                sel = null;

            if (document.selection) {
                range = document.body.createTextRange();
                range.moveToElementText(node);
                range.select();
            } else if (window.getSelection) {
                range = document.createRange();
                range.selectNode(node);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            tmp.remove();
            return this;
        }
    }
);
