/*
 * Copyright Mozilla Public License 1.1
 */

define(
    [
        "jquery",
        "triple_brain.mind-map_template",
        "jquery.fancybox"
    ],
    function ($, MindMapTemplate) {
        var api = {}
        api.ofVertex = function (vertex) {
            return new ImageMenu(vertex);
        }
        return api;

        function ImageMenu(vertex) {
            var imageMenu = this;
            var html;
            this.create = function () {
                html = MindMapTemplate['image_container'].merge();
                addHtmlToVertex();
                return imageMenu;
            }
            this.refreshImages = function () {
                $(html).empty();
                var images = vertex.getImages();
                if (images.length <= 0) return;
                var image = MindMapTemplate["image_container_image"].merge({
                        src:images[0].getUrlForSmall()
                    }
                );
                $(html).append(
                    image
                );
                var positioningFunction = vertex.isCenterVertex() ?
                    positionNextToVertex:
                    positionNextToText;
                positioningFunction(image);
                $(image).load(function () {
                    var positioningFunction = vertex.isCenterVertex() ?
                        positionNextToVertex:
                        positionNextToText;
                    positioningFunction(this);
                });
            }

            this.positionNextToText = function(){
                positionNextToText(
                    $(html).find("img")
                );
            }
            this.positionNextToVertex = function(){
                positionNextToVertex(
                    $(html).find("img")
                );
            }

            function positionNextToText(image){
                var separationFromVertexInPixels = -30;
                adjustPosition(image, separationFromVertexInPixels);
            }

            function positionNextToVertex(image){
                var separationFromVertexInPixels = 5;
                adjustPosition(image, separationFromVertexInPixels);
            }

            function adjustPosition(image, horizontalDistanceFromVertexInPixels) {
                var addedImageWidth = $(image).width();
                var marginLeft = (addedImageWidth + horizontalDistanceFromVertexInPixels) * -1;
                $(html).css("margin-left", marginLeft);
                var addedImageHeight = $(image).height();
                var vertexHeight = vertex.height();
                var differenceOfHeight = vertexHeight - addedImageHeight;
                $(html).css(
                    "margin-top",
                    differenceOfHeight / 2
                );
            }

            function addHtmlToVertex() {
                $(vertex.getHtml()).prepend(
                    html
                );
            }
        }

    }
);