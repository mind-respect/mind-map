/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.ui.vertex",
    "triple_brain.object_utils"
], function(VertexUi, ObjectUtils){
    var api = {};
    api.withHtml = function(html){
        return new api.Object(
            $(html)
        );
    };
    api.ofVertex = function(vertex){
        return api.withHtml(
            vertex.getHtml()
        );
    };
    api = ObjectUtils.extendedApiForChildUsingParent(
        api,
        VertexUi
    );
    api.Object = function(html){
        var self = this;
        this.getChildrenOrientation = function(){
            return "right";
        };
        this.isALeaf = function(){
            return self.connectedEdges().length === 1;
        };
        VertexUi.Object.apply(this, [html]);
    };
    return api;
});