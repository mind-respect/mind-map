/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.ui.edge"
],
    function ($, GraphUi, Edge) {
        var api = {};
        api.EMPTY_LABEL = Edge.EMPTY_LABEL;
        api.withHtml = function (html) {
            return new GraphEdge(html);
        };
        api.onMouseOver = function () {
            var edge = api.withHtml(this);
            GraphUi.setEdgeMouseOver(edge);
            edge.highlight();
            edge.showMenu();
        };
        api.onMouseOut = function () {
            var edge = api.withHtml(this);
            GraphUi.unsetEdgeMouseOver();
            if (!edge.isTextFieldInFocus()) {
                edge.unhighlight();
            }
            edge.hideMenu();
        };
        function GraphEdge(html){
            this.setText = function (text) {
                $(label()).val(text);
            };
            this.text = function () {
                return $(label()).val();
            };
            function label() {
                return $(html).find("input[type='text']");
            }
            Edge.Object.apply(this, [html]);
        }
        GraphEdge.prototype = new Edge.Object();
        return api;
    }
);