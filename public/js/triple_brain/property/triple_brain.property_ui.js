/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui",
    "jquery.i18next"
], function($, TreeEdge, GraphElementUi){
    "use strict";
    var api = {};
    TreeEdge.buildCommonConstructors(api);
    api.createFromHtml = function(html){
        var property = new api.PropertyUi(html);
        api.initCache(property);
        return property;
    };
    api.visitAllProperties = function (visitor) {
        api.visitAll(function(element){
            if(element.isProperty()){
                visitor(element);
            }
        });
    };
    api.getWhenEmptyLabel = function(){
        return $.t("property.when-empty");
    };
    api.PropertyUi = function(html){
        this.html = html;
        TreeEdge.TreeEdge.apply(this);
        this.init(this.html);
    };
    api.PropertyUi.prototype = new TreeEdge.TreeEdge();
    api.PropertyUi.prototype.getGraphElementType = function(){
        return GraphElementUi.Types.Property;
    };
    api.PropertyUi.prototype.remove = function () {
        this.html.closest(".vertex-tree-container").remove();
    };
    return api;
});
