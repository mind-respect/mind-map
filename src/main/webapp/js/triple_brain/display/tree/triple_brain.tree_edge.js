/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.edge"
],
    function ($, Edge) {
        var api = {};
        api.EMPTY_LABEL = Edge.EMPTY_LABEL;
        api.redrawAllEdges = Edge.redrawAllEdges;
        api.withHtml = function (html) {
            html = $(html);
            return new Object(html);
        };
        return api;
        function Object(html){
            this.setText = function (text) {
                var label = getLabel();
                label.is(":input") ?
                    label.val(text) :
                    label.text(text);
            };
            this.text = function () {
                var label = getLabel();
                return label.is(":input") ?
                    label.val() :
                    label.text();
            };
            function getLabel(){
                return html;
            }
            Edge.Object.apply(this, [html]);
        }
        Object.prototype = new Edge.Object();
        return api;
    }
);