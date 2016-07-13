/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [
        "jquery",
        "triple_brain.mind-map_template",
        "jquery.colorbox"
    ],
    function ($, MindMapTemplate) {
        "use strict";
        var api = {};
        api.ofBubble = function (bubble) {
            return new ImageMenu(bubble);
        };
        return api;

        function ImageMenu(bubble) {
            var imageMenu = this,
                html;
            this.create = function () {
                html = $(
                    MindMapTemplate[
                        'image_container'
                        ].merge()
                );
                addHtmlToBubble();
                return imageMenu;
            };
            this.refreshImages = function () {
                var images = bubble.getImages();
                if (images.length <= 0) {
                    html.empty();
                    return;
                }
                images = imagesInOrderThatPrioritizeUserUploadedImages(images);
                var featuredImage = images[0];
                var featuredImageBigUri = featuredImage.getUrlFor600pxOrBig();
                var featuredImageHtml = $(MindMapTemplate["image_container_image"].merge({
                        src: featuredImage.getBase64ForSmall()
                    }
                ));
                var bubbleId = bubble.getId();
                html.detach();
                html.empty();
                for (var i = 0; i < images.length; i++) {
                    var image = images[i];
                    var urlForBigger = image.getUrlFor600pxOrBig();
                    var bigImageAnchor = $("<a>").attr(
                        'rel', bubbleId
                    ).prop(
                        "href",
                        urlForBigger
                    ).click(
                        handleImageClick
                    ).colorbox({
                            rel: bubbleId,
                            href: urlForBigger,
                            photo: true
                        }
                    );
                    if (urlForBigger === featuredImageBigUri) {
                        bigImageAnchor.append(
                            featuredImageHtml
                        );
                    }
                    html.append(
                        bigImageAnchor
                    );
                }
                addHtmlToBubble();
            };

            this.width = function () {
                return $(html).width();
            };

            function handleImageClick(event) {
                event.preventDefault();
                var anchor = $(this);
                $.colorbox({
                    rel: anchor.attr("rel"),
                    href: anchor.prop("href"),
                    photo: true,
                    scalePhotos:true,
                    onOpen: function () {
                        $.colorbox.next();
                    }
                });
            }

            function addHtmlToBubble() {
                var className = bubble.isInTheRelationFamily() ?
                    ".in-bubble-content" :
                    ".in-bubble-content-wrapper";
                bubble.getHtml().children(
                    className
                ).before(html);
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