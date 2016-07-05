/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.edge_ui"
    ],
    function ($, EdgeUi) {
        "use strict";
        var api = {};
        api.buildCommonConstructors = EdgeUi.buildCommonConstructors;
        EdgeUi.buildCommonConstructors(api);
        api.createFromHtmlAndUri = function (html, uri) {
            var edge = new api.Self().init(
                html
            );
            edge.setUri(uri);
            api.initCache(
                edge
            );
            EdgeUi.initCache(
                edge
            );
            return edge;
        };
        api.getWhenEmptyLabel = function () {
            return EdgeUi.getWhenEmptyLabel();
        };
        api.ofEdge = function (edge) {
            return api.withHtml(
                edge.getHtml()
            );
        };
        api.Self = function () {
        };
        api.Self.prototype = new EdgeUi.Object();
        api.Self.prototype.init = function (html) {
            this.html = html;
            EdgeUi.Object.apply(this, [html]);
            return this;
        };
        api.Self.prototype.text = function () {
            return this.getLabel().text();
        };
        api.Self.prototype.childVertexInDisplay = function () {
            return this.getTopMostChildBubble();
        };
        api.Self.prototype.isInverse = function () {
            return this.html.hasClass("inverse");
        };
        api.Self.prototype.serverFormat = function () {
            return {
                label: this.text(),
                source_vertex_id: this.getSourceVertex().getId(),
                destination_vertex_id: this.getDestinationVertex().getId()
            };
        };
        api.Self.prototype.getLabel = function () {
            return this.html.find(".bubble-label");
        };
        api.Self.prototype.inverse = function () {
            this.html[
                this.html.hasClass("inverse") ?
                    "removeClass" :
                    "addClass"
                ]("inverse");
            var childVertexHtml = this.childVertexInDisplay().getHtml();
            childVertexHtml[
                childVertexHtml.hasClass("inverse") ?
                    "removeClass" :
                    "addClass"
                ]("inverse");
            this.inverseAbstract();
        };
        api.Self.prototype.removeFromCache = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            EdgeUi.removeFromCache(
                this.getUri(),
                this.getId()
            );
        };
        api.Self.prototype.getLabelAndButtonsContainer = function () {
            return this.html.find(
                ".label-and-buttons"
            );
        };
        api.Self.prototype.reviewEditButtonDisplay = function () {
            var parentBubble = this.getParentBubble();
            if (!parentBubble.isGroupRelation() || parentBubble.text() !== this.text()) {
                return;
            }
            this.getHtml().addClass("same-as-group-relation");
        };
        return api;
    }
);