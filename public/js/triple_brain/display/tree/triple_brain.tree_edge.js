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
            var edge = new api.TreeEdge().init(
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
        api.TreeEdge = function () {
        };
        api.TreeEdge.prototype = new EdgeUi.EdgeUi();
        api.TreeEdge.prototype.init = function (html) {
            this.html = html;
            EdgeUi.EdgeUi.apply(this, [html]);
            return this;
        };
        api.TreeEdge.prototype.text = function () {
            return this.getLabel().text();
        };
        api.TreeEdge.prototype.childVertexInDisplay = function () {
            return this.getTopMostChildBubble();
        };
        api.TreeEdge.prototype.isInverse = function () {
            return this.html.hasClass("inverse");
        };
        api.TreeEdge.prototype.serverFormat = function () {
            return {
                label: this.text(),
                source_vertex_id: this.getSourceVertex().getId(),
                destination_vertex_id: this.getDestinationVertex().getId()
            };
        };
        api.TreeEdge.prototype.getLabel = function () {
            return this.html.find(".bubble-label");
        };
        api.TreeEdge.prototype.inverse = function () {
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
        api.TreeEdge.prototype.removeFromCache = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            EdgeUi.removeFromCache(
                this.getUri(),
                this.getId()
            );
        };
        api.TreeEdge.prototype.getLabelAndButtonsContainer = function () {
            return this.html.find(
                ".label-and-buttons"
            );
        };
        api.TreeEdge.prototype.reviewEditButtonDisplay = function () {
            var parentBubble = this.getParentBubble();
            if(!parentBubble.isGroupRelation()){
                return;
            }
            if (parentBubble.text() !== this.text() && "" !== this.text().trim()) {
                return;
            }
            this.setAsSameAsGroupRelation();
        };
        return api;
    }
);