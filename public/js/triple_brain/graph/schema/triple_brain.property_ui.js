/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui"
], function(TreeEdge, GraphElementUi){
    "use strict";
    var api = {};
    TreeEdge.buildCommonConstructors(api);
    api.createFromHtml = function(html){
        var property = new api.Self(html);
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
        return "property";
    };
    api.Self = function(html){
        this.html = html;
        TreeEdge.Self.apply(this);
        this.init(this.html);
    };
    api.Self.prototype = new TreeEdge.Self();
    api.Self.prototype.getGraphElementType = function(){
        return GraphElementUi.Types.Property;
    };
    api.Self.prototype.remove = function () {
        this.html.closest(".vertex-tree-container").remove();
    };
    return api;
});
