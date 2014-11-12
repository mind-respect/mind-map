/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui"
], function(TreeEdge, GraphElementUi){
    "use strict";
    var api = {};
    api.withHtml = function(html){
        return new Self(html)
    };
    api.getWhenEmptyLabel = function(){
        return "property";
    };
    function Self(html){
        this.html = html;
        TreeEdge.Self.apply(this);
        this.init(this.html);
    }
    Self.prototype = new TreeEdge.Self;
    Self.prototype.getGraphElementType = function(){
        return GraphElementUi.Types.Property;
    };

    Self.prototype.getLabel = function () {
        return this.html.find(".in-bubble-content > input").is(":visible") ?
            this.html.find("> .in-bubble-content > input") :
            this.html.find("span.label");
    };
    Self.prototype.integrateIdentification = function (identification) {
        this.addImages(
            identification.getImages()
        );
    };
    Self.prototype.remove = function () {
        this.html.closest(".vertex-tree-container").remove();
    };
    return api;
});
