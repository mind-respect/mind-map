/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function ($) {
        $.fn.focusEnd = function () {
            var $this = $(this);
            $this.focus();
            if ($this.is("input")) {
                var initialVal = this.val();
                this.val('');
                this.val(initialVal);
                return;
            }
            if ($this.text().length === 0) {
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
        };
        $.fn.focusAtPosition = function (event) {
            var $this = this;
            $this.focus();
            if ($this.text().trim() === "") {
                return;
            }
            var caretRange = getMouseEventCaretRange(event);
            window.setTimeout(function () {
                selectRange(caretRange);
            }, 10);
        };

        function selectRange(range) {
            if (range) {
                if (typeof range.select != "undefined") {
                    range.select();
                } else if (typeof window.getSelection != "undefined") {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        function getMouseEventCaretRange(evt) {
            var range, x = evt.clientX, y = evt.clientY;

            // Try the simple IE way first
            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToPoint(x, y);
            }

            else if (typeof document.createRange != "undefined") {
                // Try Mozilla's rangeOffset and rangeParent properties, which are exactly what we want

                if (typeof evt.rangeParent != "undefined") {
                    range = document.createRange();
                    range.setStart(evt.rangeParent, evt.rangeOffset);
                    range.collapse(true);
                }

                // Try the standards-based way next
                else if (document.caretPositionFromPoint) {
                    var pos = document.caretPositionFromPoint(x, y);
                    range = document.createRange();
                    range.setStart(pos.offsetNode, pos.offset);
                    range.collapse(true);
                }

                // Next, the WebKit way
                else if (document.caretRangeFromPoint) {
                    range = document.caretRangeFromPoint(x, y);
                }
            }

            return range;
        }

    }
);
