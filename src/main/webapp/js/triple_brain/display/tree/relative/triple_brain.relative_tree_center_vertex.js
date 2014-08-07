/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.graph_displayer"
    ],
    function (GraphDisplayer) {
        var api = {};
        api.usingVertex = function (vertex) {
            return new Object(
                vertex
            );
        };
        return api;
        function Object(vertex) {
            var self = this;
            this.hasChildToLeft = function () {
                return self._getTopMostChildToLeftContainer().length > 0;
            };
            this.hasChildToRight = function () {
                return self._getTopMostChildToRightContainer().length > 0;
            };
            this.getToTheLeftTopMostChild = function () {
                return vertex.getBubble().getGroupRelationOrVertexFromContainer(
                    self._getTopMostChildToLeftContainer()
                );
            };
            this.getToTheRightTopMostChild = function () {
                return vertex.getBubble().getGroupRelationOrVertexFromContainer(
                    self._getTopMostChildToRightContainer()
                );
            };
            this._getTopMostChildToRightContainer = function () {
                return vertex.getHtml().closest(".vertex-container").siblings(
                    ".vertices-children-container"
                ).filter(":not(.left-oriented)").find(">.vertex-tree-container:first >.vertex-container");
            };
            this._getTopMostChildToLeftContainer = function () {
                return vertex.getHtml().closest(".vertex-container").siblings(
                    ".vertices-children-container.left-oriented")
                    .find(">.vertex-tree-container:first >.vertex-container");
            };
        }
    }
);