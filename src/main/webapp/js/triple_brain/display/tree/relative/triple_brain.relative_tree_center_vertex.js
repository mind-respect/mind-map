/*
 * Copyright Mozilla Public License 1.1
 */
define(
    ["require"],
    function(require){
        var api = {};
        api.usingVertex = function(vertex){
            return new Object(
                vertex
            );
        };
        return api;
        function Object(vertex){
            var self = this;
            this.visitLeftVertices = function (visitor) {
                var RelativeTreeVertex = require("triple_brain.relative_tree_vertex");
                var children = self.getLeftChildren();
                $.each(children, function () {
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    visitor(vertex);
                });
            };
            this.hasChildToLeft = function(){
                return self.getLeftChildren().length > 0;
            };
            this.hasChildToRight = function(){
                return self.getChildrenToRight().length > 0;
            };
            this.getLeftChildren = function(){
                return vertex.getHtml().closest(".vertex-container").siblings(
                    ".vertices-children-container.left-oriented"
                ).find(".vertex");
            };
            this.getChildrenToRight = function(){
                return vertex.getHtml().closest(".vertex-container").siblings(
                    ".vertices-children-container"
                ).filter(":not(.left-oriented)").find(".vertex");
            };
            this.getTopMostChildToRightHtml = function(){
                return self.getChildrenToRight()[0];
            };
            this.getTopMostChildToLeftHtml = function(){
                return self.getLeftChildren()[0];
            };
        }
    }
);