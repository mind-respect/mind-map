/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.graph_displayer"
    ], function (GraphDisplayer) {
        "use strict";
        var api = {};
        api.withHtml = function (html) {
            return new Self(html);
        };
        function Self(html) {
            this.html = html;
        }

        Self.prototype.getParentBubble = function () {
            return this.getGroupRelationOrVertexFromContainer(
                this._getParentVertexContainer()
            );
        };
        Self.prototype.getParentVertex = function () {
            var parentContainer = this._getParentVertexContainer(),
                parentVertexHtml = parentContainer.find(
                    "> .vertex"
                );
            return parentVertexHtml.length === 0 ?
                GraphDisplayer.getGroupRelationSelector().withHtml(
                    parentContainer.find("> .group-relation")
                ).getParentVertex() :
                GraphDisplayer.getVertexSelector().withHtml(
                    parentVertexHtml
                );
        };
        Self.prototype.getChildrenContainer = function () {
            return this.html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            )
        };

        Self.prototype.getTopMostChild = function () {
            var topMostChildHtml = $(this.getChildrenBubblesHtml()[0]);
            return topMostChildHtml.hasClass("group-relation") ?
                GraphDisplayer.getGroupRelationSelector().withHtml(topMostChildHtml) :
                GraphDisplayer.getVertexSelector().withHtml(topMostChildHtml);
        };

        Self.prototype.getChildrenBubblesHtml = function () {
            return this.getChildrenContainer().find(
                ".group-relation, .vertex"
            );
        };

        Self.prototype.getBubbleAbove = function () {
            return this.getGroupRelationOrVertexFromContainer(
                this._getBubbleAboveContainer()
            );
        };
        Self.prototype.hasBubbleAbove = function(){
            return this._getBubbleAboveContainer().length > 0;
        };
        Self.prototype.hasBubbleUnder = function(){
            return this._getBubbleUnderContainer().length > 0;
        };
        Self.prototype.getBubbleUnder = function () {
            return this.getGroupRelationOrVertexFromContainer(
                this._getBubbleUnderContainer()
            );
        };
        Self.prototype._getBubbleUnderContainer = function(){
            return this.html.closest(
                ".vertex-tree-container"
            ).nextAll(
                ".vertex-tree-container:first"
            ).find("> .vertex-container")
        };
        Self.prototype._getBubbleAboveContainer = function(){
            return this.html.closest(
                ".vertex-tree-container"
            ).prevAll(
                ".vertex-tree-container:first"
            ).find("> .vertex-container");
        };
        Self.prototype._getParentVertexContainer = function () {
            return this.html.closest(".vertices-children-container")
                .siblings(".vertex-container");
        };
        Self.prototype.hasChildren = function () {
            return this.getChildrenBubblesHtml().length > 0;
        };
        Self.prototype.getGroupRelationOrVertexFromContainer = function(container){
            var vertexHtml = container.find("> .vertex");
            return vertexHtml.length > 0 ?
                GraphDisplayer.getVertexSelector().withHtml(vertexHtml) :
                GraphDisplayer.getGroupRelationSelector().withHtml(
                    container.find("> .group-relation")
                );
        };
        return api;
    }
);
