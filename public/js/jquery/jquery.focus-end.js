/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.point"
],
    function ($, Point) {
        $.fn.focusEnd = function() {
            var $this = $(this);
            $this.focus();
            if($this.is("input")){
                var initialVal = this.val();
                this.val('');
                this.val(initialVal);
                return;
            }
            if($this.text().length === 0){
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
        $.fn.focusAtPosition = function(clickPosition) {
            var $this = this;
            $this.focus();
            if($this.is("input")){
                var initialVal = this.val();
                this.val('');
                this.val(initialVal);
                return;
            }
            if($this.text().length === 0){
                return;
            }
            //http://stackoverflow.com/questions/1181700/set-cursor-position-on-contenteditable-div
            // var tmp = $('<span />').appendTo($this),
            var node = this[0],
                range = null,
                sel = null;
            if (document.selection) {
                range = document.body.createTextRange();
                range.moveToElementText(node);
                range.setSelectionRange(5, 5);
            } else if (window.getSelection) {
                range = document.createRange();
                // range.selectNode(node);
                var charIndex = getCharIndex.bind(this)();
                var textNode = node.firstChild;
                range.setStart(textNode, charIndex);
                range.setEnd(textNode, charIndex);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            // tmp.remove();
            return this;
            function getCharIndex(){
                // var width = this.width();
                // var textLength = this.text().length;
                // return Math.round(
                //     (clickPosition.x) / (this.width() / this.text().length)
                // );
                spanAllText.bind(this)();

                var spans = this.find("span");
                var charIndex = this.text().length;
                var smallestDistance = 999;
                var closeEnough = 15;
                for(var i = 0; i < spans.length; i++){
                    var $span = $(spans[i]);
                    var charPoint = Point.fromHtmlPoint(
                        $span.position()
                    );
                    // charPoint.x += $span.width() / 2;/
                    // charPoint.y += $span.height() / 2;
                    var distance = clickPosition.distanceFromPoint(
                        charPoint
                    );
                    if(distance < closeEnough && distance < smallestDistance){
                        charIndex = i + 1;
                        // if(clickPosition.x > (charPoint.x + $span.width() / 2)){
                        //     charIndex++;
                        // }
                        smallestDistance = distance;
                    }
                }
                this.html(this.text());
                return charIndex > this.text().length ? this.text().length : charIndex;
            }
            function spanAllText(){
                var html = "";
                this.text().split("").forEach(function(char){
                    html += "<span>" + char + "</span>";
                });
                this.html(html);
            }
        };

    }
);
