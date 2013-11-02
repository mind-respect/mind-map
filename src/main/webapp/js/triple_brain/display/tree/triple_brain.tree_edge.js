/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.ui.edge",
    "triple_brain.graph_displayer"
],
    function (require, $, EdgeUi, GraphDisplayer) {
        var api = {};
        api.getWhenEmptyLabel = function () {
            return EdgeUi.getWhenEmptyLabel();
        };
        api.visitAllEdges = function(visitor){
            $(".relation").each(function () {
                visitor(
                    api.withHtml(this)
                );
            });
        };
        api.redrawAllEdges = EdgeUi.redrawAllEdges;

        api.withHtml = function (html) {
            return new Object($(html));
        };
        api.ofEdge = function (edge) {
            return api.withHtml(
                edge.getHtml()
            );
        };
        return api;
        function Object(html) {
            var self = this;
            this.setText = function (text) {
                var label = self.getLabel();
                label.is(":input") ?
                    label.val(text) :
                    label.text(text);
            };
            this.text = function () {
                var label = self.getLabel();
                return label.is(":input") ?
                    label.val() :
                    label.text();
            };
            this.childVertexInDisplay = function () {
                return GraphDisplayer.getVertexSelector().withHtml(
                    html.closest(".vertex")
                );
            };
            this.isInverse = function () {
                return html.hasClass("inverse");
            };
            this.serverFormat = function () {
                return {
                    label:self.text(),
                    source_vertex_id:self.sourceVertex().getId(),
                    destination_vertex_id:self.destinationVertex().getId()
                }
            };
            this.getLabel = function () {
                return html.find("> input").length > 0 ?
                    html.find("> input") :
                    html.find("> span.label");
            };
            this.readjustLabelWidth = function () {
                //do nothing;
            };
            this.focus = function () {
                html.centerOnScreen();
            };
            this.inverse = function(){
                html[
                    html.hasClass("inverse") ?
                        "removeClass" :
                        "addClass"
                    ]("inverse");
                EdgeUi.withHtml(html).inverseAbstract();
            };
            EdgeUi.Object.apply(this, [html]);
        }

        Object.prototype = new EdgeUi.Object();
        return api;
    }
);