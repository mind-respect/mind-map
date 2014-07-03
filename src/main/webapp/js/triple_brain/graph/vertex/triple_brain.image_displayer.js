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
        var api = {};
        api.ofVertex = function (vertex) {
            return new ImageMenu(vertex);
        };
        return api;

        function ImageMenu(vertex) {
            var imageMenu = this,
                html;
            this.create = function () {
                html = $(
                    MindMapTemplate[
                        'image_container'
                        ].merge()
                );
                addHtmlToVertex();
                return imageMenu;
            };
            this.refreshImages = function () {
                var images = vertex.getImages();
                if (images.length <= 0) return;
                images = imagesInOrderThatPrioritizeUserUploadedImages(images);
                var featuredImage = images[0];
                var featuredImageBigUri =  featuredImage.getUrlForBigger();
                var featuredImageHtml = $(MindMapTemplate["image_container_image"].merge({
                        src: featuredImage.getBase64ForSmall()
                    }
                ));
                var vertexId = vertex.getId();
                html.detach();
                html.empty();
                for (var i = 0; i < images.length; i++) {
                    var image = images[i];
                    var urlForBigger = image.getUrlForBigger();
                    var bigImageAnchor = $("<a>").attr(
                        'rel', vertexId
                    ).prop(
                        "href",
                        urlForBigger
                    ).click(function(e){
                            e.preventDefault();
                            var anchor = $(this);
                            $.colorbox({
                                rel:anchor.attr("rel"),
                                href:anchor.prop("href"),
                                photo:true,
                                onOpen:function(){
                                    $.colorbox.next();
                                }
                            });
                        }).colorbox({
                            rel: vertexId,
                            href: urlForBigger,
                            photo:true
                        });
                    if(urlForBigger === featuredImageBigUri){
                        bigImageAnchor.append(
                            featuredImageHtml
                        );
                    }
                    html.append(
                        bigImageAnchor
                    );
                }
                addHtmlToVertex();
            };

            this.width = function () {
                return $(html).width();
            };

            function addHtmlToVertex() {
                vertex.getHtml().prepend(html);
            }

            function imagesInOrderThatPrioritizeUserUploadedImages(images) {
                return images.sort(function (image1, image2) {
                    var isImage1UploadedByUser = image1.isUploadedByUser();
                    var isImage2UploadedByUser = image2.isUploadedByUser();
                    if (isImage1UploadedByUser && isImage2UploadedByUser) {
                        return 0;
                    } else if (isImage1UploadedByUser) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            }
        }

    }
);