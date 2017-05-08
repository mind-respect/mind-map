/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.tree_edge",
    "triple_brain.graph_element_type"
], function ($, TreeEdge, GraphElementType) {
    "use strict";
    var api = {};
    TreeEdge.buildCommonConstructors(api);
    api.createFromHtml = function(html){
        var property = new api.MetaUiRelation(html);
        api.initCache(property);
        return property;
    };
    api.getWhenEmptyLabel = function(){
        return $.t("meta_relation.default");
    };
    api.MetaUiRelation = function(html){
        this.html = html;
        TreeEdge.TreeEdge.apply(this);
        this.init(this.html);
    };
    api.MetaUiRelation.prototype = new TreeEdge.TreeEdge();
    api.MetaUiRelation.prototype.getGraphElementType = function(){
        return GraphElementType.MetaRelation;
    };
    return api;
});