/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex"
], function ($, Vertex) {
    var api = {};
    api.withVertex = function (vertex) {
        return new RelativeVertex(vertex.getHtml());
    };
    api.withVertexHtml = function (vertexHtml) {
        return new RelativeVertex(vertexHtml);
    };
    return api;
    function RelativeVertex(html) {
        html = $(html);
        var _isToTheLeft;
        var thisRelativeVertex = this;
        this.isToTheLeft = function () {
            if (_isToTheLeft === undefined) {
                _isToTheLeft = html.parents(".left-oriented").length > 0;
            }
            return _isToTheLeft;
        };
        this.adjustPositionIfApplicable = function () {
            if (thisRelativeVertex.isToTheLeft()) {
                thisRelativeVertex.adjustPosition();
            }
        };
        this.adjustAllChildrenPositionIfApplicable = function () {
            var vertex = Vertex.withHtml(html);
            if (thisRelativeVertex.isToTheLeft() || vertex.isCenterVertex()) {
                var visit = vertex.isCenterVertex() ?
                    thisRelativeVertex.visitCenterVertexLeftVertices :
                    thisRelativeVertex.visitChildren
                visit(function (vertex) {
                    var relativeVertex = api.withVertex(vertex);
                    relativeVertex.adjustPosition();
                });
            }
            ;
        };
        this.adjustPosition = function (parentVertexHtml) {
            var width = html.width();
            var vertex = Vertex.withHtml(html);
            var imageOffset = vertex.hasImages() && !vertex.getImageMenu().isDoneLoadingImage() ?
                60 : 0;
            if (parentVertexHtml === undefined) {
                parentVertexHtml = getParentVertex();
            }
            var parentWidth = $(parentVertexHtml).width();
            html.closest(".vertex-tree-container").css(
                "margin-left", "-" + (parentWidth + width + 70 + imageOffset) + "px"
            );
        };
        this.visitChildren = function (visitor) {
            var children = html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            ).find(".vertex");
            $.each(children, function () {
                var vertex = Vertex.withHtml(this);
                visitor(vertex);
            });
        };
        this.visitCenterVertexLeftVertices = function (visitor) {
            var children = html.closest(".vertex-container").siblings(
                ".vertices-children-container.left-oriented"
            ).find(".vertex");
            $.each(children, function () {
                var vertex = Vertex.withHtml(this);
                visitor(vertex);
            });
        };
        function getParentVertex() {
            return html.closest(".vertices-children-container")
                .siblings(".vertex-container");
        }
    }
});