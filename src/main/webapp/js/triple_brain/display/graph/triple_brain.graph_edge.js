/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.ui.edge",
    "triple_brain.ui.vertex_and_edge_common"
],
    function ($, GraphUi, Edge, VertexAndEdgeCommon) {
        var api = {};
        api.EMPTY_LABEL = Edge.EMPTY_LABEL;
        api.withHtml = function (html) {
            return new GraphEdge(
                $(html)
            );
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
            var self = this;
            this.setText = function (text) {
                self.getLabel().val(text);
            };
            this.text = function () {
                self.getLabel().val();
            };
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    self.getLabel()
                );
                this.adjustWidth();
            };
            this.getLabel = function(){
                return html.find("input[type='text']");
            };
            this.focus = function(){
                self.getLabel().focus();
            };
            Edge.Object.apply(this, [html]);
        }
        GraphEdge.prototype = new Edge.Object();
        return api;
    }
);