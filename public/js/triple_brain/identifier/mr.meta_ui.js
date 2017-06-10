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
    function MetaUi(){

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
    MetaUi.prototype.hasHiddenRelations = function(){
        return false;
    };
    MetaUi.prototype.getNumberOfHiddenRelations = function(){
        return 0
    };
    return api;
});