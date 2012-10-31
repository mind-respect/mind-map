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
                position();
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
                adjustPosition(image);
                $(image).load(function () {
                    adjustPosition(this);
                });
                function adjustPosition(image) {
                    var addedImageWidth = $(image).width();
                    var separationFromVertexInPixels = 5;
                    var marginLeft = (addedImageWidth + separationFromVertexInPixels) * -1;
                    $(html).css("margin-left", marginLeft);

                    var addedImageHeight = $(image).height();
                    var vertexHeight = vertex.height();
                    var differenceOfHeight = vertexHeight - addedImageHeight;
                    $(html).css(
                        "margin-top",
                        differenceOfHeight / 2
                    );
                }
            }
            this.reEvaluatePosition = function () {
                position();
            }
            this.show = function () {
                $(html).remove();
                addHtmlToVertex();
                $(html).show();
                position();
            }
            this.hide = function () {
                $(html).hide();
            }

            function addHtmlToVertex() {
                $(vertex.getHtml()).prepend(
                    html
                );
            }

            function position() {

            }
        }

    }
);