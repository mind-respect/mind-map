/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_ui",
    "triple_brain.graph_element_ui"
], function ($, VertexUi, GraphElementUi) {
    "use strict";
    var api = {};
    VertexUi.buildCommonConstructors(api);
    api.getWhenEmptyLabel = function () {
        return $.t("identifier.default");
    };
    api.createFromHtml = function (html) {
        var vertex = new MetaUi().init(
            html
        );
        api.initCache(
            vertex
        );
        VertexUi.initCache(
            vertex
        );
        return vertex;
    };

    function MetaUi() {

    }

    MetaUi.prototype = new VertexUi.VertexUi();
    MetaUi.prototype.init = function (html) {
        this.html = html;
        VertexUi.VertexUi.apply(this, [html]);
        VertexUi.VertexUi.prototype.init.call(
            this
        );
        return this;
    };
    MetaUi.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.Meta;
    };
    MetaUi.prototype.hasHiddenRelations = function () {
        return false;
    };
    MetaUi.prototype.getNumberOfHiddenRelations = function () {
        return 0;
    };
    MetaUi.prototype.removeFromCache = function () {
        api.removeFromCache(
            this.getUri(),
            this.getId()
        );
        VertexUi.removeFromCache(
            this.getUri(),
            this.getId()
        );
    };
    MetaUi.prototype.initCache = function () {
        api.initCache(
            this
        );
        VertexUi.initCache(
            this
        );
    };
    MetaUi.prototype.wikipediaLinksInLabelButtonContent = function () {
        var list = $("<ul class='list-group'>");
        this.getModel().getWikipediaLink().then(function (link) {
            list.append(
                $("<a class='list-group-item'>").attr(
                    "href",
                    link.link
                ).attr(
                    "target",
                    "_blank"
                ).append(
                    $("<i>").addClass(
                        "fa fa-wikipedia-w pull-right"
                    )
                ).append(
                    $("<span>").text(link.label)
                ).mousedown(function () {
                    window.open($(this).attr("href"), "_blank");
                })
            );
        });
        return list;
    };
    return api;
});