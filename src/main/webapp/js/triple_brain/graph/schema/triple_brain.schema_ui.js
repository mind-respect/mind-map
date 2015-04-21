/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_element_ui"
], function (RelativeTreeVertex, GraphElementUi) {
    "use strict";
    var api = {};
    RelativeTreeVertex.buildCommonConstructors(api);
    api.get = function(){
        return api.withHtml(
            $(".schema.vertex")
        );
    };
    api.getWhenEmptyLabel = function(){
        return "schema";
    };
    api.Self = function(html) {
        this.html = html;
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    };
    api.Self.prototype = new RelativeTreeVertex.Object;
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.Schema;
    };
    return api;
});