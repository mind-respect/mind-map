/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.ui.edge",
    "triple_brain.tree_vertex"
],
    function (require, $, Edge, TreeVertex) {
        var api = {};
        api.EMPTY_LABEL = Edge.EMPTY_LABEL;
        api.redrawAllEdges = Edge.redrawAllEdges;
        api.withHtml = function (html) {
            return new Object($(html));
        };
        api.ofEdge = function(edge){
            return api.withHtml(
                edge.getHtml()
            );
        };
        return api;
        function Object(html){
            var self = this;
            this.setText = function (text) {
                var label = self.getLabel();
                label.is(":input") ?
                    label.val(text) :
                    label.text(text);
            };
            this.text = function () {
                var label = self.getLabel();
                return label.is(":input") ?
                    label.val() :
                    label.text();
            };
            this.childVertexInDisplay = function(){
                return getTreeVertex().withHtml(
                    html.closest(".vertex")
                );
            };
            this.isInverse = function(){
                return html.hasClass("inverse");
            };
            this.serverFormat = function(){
                return {
                    label : self.text(),
                    source_vertex_id : self.sourceVertex().getId(),
                    destination_vertex_id : self.destinationVertex().getId()
                }
            };
            this.getLabel = function(){
                return html.is(":input") ?
                    html :
                    html.find("> span.label");
            };
            this.readjustLabelWidth = function(){
                //do nothing;
            };
            function getTreeVertex(){
                if(TreeVertex === undefined){
                    TreeVertex = require("triple_brain.tree_vertex");
                }
                return TreeVertex;
            }
            Edge.Object.apply(this, [html]);
        }
        Object.prototype = new Edge.Object();
        return api;
    }
);