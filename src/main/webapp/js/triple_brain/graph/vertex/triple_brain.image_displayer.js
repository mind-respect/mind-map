/*
 * Copyright Mozilla Public License 1.1
 */

define(
    [
        "jquery",
        "triple_brain.mind-map_template",
        "jquery.colorbox"
    ],
    function ($, MindMapTemplate) {
        var api = {}
        api.ofVertex = function (vertex) {
            return new ImageMenu(vertex);
        };
        return api;

        function ImageMenu(vertex) {
            var imageMenu = this;
            var html;
            this.create = function () {
                html = MindMapTemplate['image_container'].merge();
                addHtmlToVertex();
                return imageMenu;
            };
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
                $(image).load(function () {
                    setUpBiggerImagesView();
                    vertex.adjustWidth();
                });

                function setUpBiggerImagesView() {
                    var vertexId = vertex.getId();
                    var images = vertex.getImages();
                    var visibleSmallImage = $(html).find("img:first");
                    $(visibleSmallImage).wrap("<a rel='" +
                        vertexId
                        + "' href='" +
                        images[0].getUrlForBigger() +
                        "'/>");
                    for (var i = 1; i < images.length; i++) {
                        var image = images[i];
                        var bigImageAnchor = $("<a rel='" +
                            vertexId
                            + "' href='"
                            + image.getUrlForBigger() +
                            "'/>");
                        $(html).append(
                            bigImageAnchor
                        );
                    }
                    $("a[rel=" + vertexId + "]").colorbox({
                        photo:true,
                        rel:vertexId
                    });
                }
            };

            this.width = function () {
                return $(html).width();
            }

            function addHtmlToVertex() {
                vertex.hasMoveButton() ?
                    vertex.moveButton().after(html) :
                    $(vertex.getHtml()).prepend(html);
            }
        }

    }
);