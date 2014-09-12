/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.ui.edge",
        "triple_brain.graph_displayer"
    ],
    function ($, EdgeUi, GraphDisplayer) {
        "use strict";
        var api = {},
            cache = {};
        api.getWhenEmptyLabel = function () {
            return EdgeUi.getWhenEmptyLabel();
        };
        api.visitAllEdges = function (visitor) {
            $(".relation").each(function () {
                visitor(
                    api.withHtml($(this))
                );
            });
        };
        api.withHtml = function (html) {
            var id = html.prop('id');
            var cachedObject = cache[id];
            if(cachedObject === undefined){
                cachedObject = new api.Self().init(html);
                cache[id] = cachedObject;
            }
            return cachedObject;
        };
        api.ofEdge = function (edge) {
            return api.withHtml(
                edge.getHtml()
            );
        };
        api.Self = function() {};
        api.Self.prototype = new EdgeUi.Object;
        api.Self.prototype.init = function(html){
            this.html = html;
            EdgeUi.Object.apply(this, [html]);
            return this;
        };
        api.Self.prototype.setText = function (text) {
            var label = this.getLabel();
            label.is(":input") ?
                label.val(text) :
                label.text(text);
        };
        api.Self.prototype.text = function () {
            var label = this.getLabel();
            return label.is(":input") ?
                label.val() :
                label.text();
        };
        api.Self.prototype.childVertexInDisplay = function () {
            return GraphDisplayer.getVertexSelector().withHtml(
                this.html.closest(".vertex")
            );
        };
        api.Self.prototype.isInverse = function () {
            return this.html.hasClass("inverse");
        };
        api.Self.prototype.serverFormat = function () {
            return {
                label: this.text(),
                source_vertex_id: this.sourceVertex().getId(),
                destination_vertex_id: this.destinationVertex().getId()
            }
        };
        api.Self.prototype.getLabel = function () {
            return this.html.find("> input").is(":visible") ?
                this.html.find("> input") :
                this.html.find("span.label");
        };
        api.Self.prototype.readjustLabelWidth = function () {
            //do nothing;
        };
        api.Self.prototype.focus = function () {
            this.html.centerOnScreen();
        };
        api.Self.prototype.inverse = function () {
            var vertexHtml = this.html.closest(".vertex");
            vertexHtml[
                vertexHtml.hasClass("inverse") ?
                    "removeClass" :
                    "addClass"
                ]("inverse");
            EdgeUi.withHtml(this.html).inverseAbstract();
        };
        api.Self.prototype.isLeftOfCenterVertex = function () {
            return this.childVertexInDisplay().isToTheLeft();
        };
        return api;
    }
);