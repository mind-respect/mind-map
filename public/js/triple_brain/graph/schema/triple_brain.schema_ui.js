/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.relative_tree_vertex",
    "triple_brain.vertex_ui",
    "triple_brain.graph_element_ui",
    "jquery.i18next"
], function ($, RelativeTreeVertex, VertexUi, GraphElementUi) {
    "use strict";
    var api = {};
    RelativeTreeVertex.buildCommonConstructors(api);
    api.createFromHtml = function(html){
        var schema = new api.Self(
            html
        );
        api.initCache(schema);
        RelativeTreeVertex.initCache(
            schema
        );
        VertexUi.initCache(
            schema
        );
        return schema;
    };
    api.get = function(){
        return api.withHtml(
            $(".schema.vertex")
        );
    };
    api.getWhenEmptyLabel = function(){
        return $.t("schema.when-empty");
    };
    api.Self = function(html) {
        this.html = html;
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    };
    api.Self.prototype = new RelativeTreeVertex.Object();
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.Schema;
    };
    return api;
});