/*
 * Copyright Mozilla Public License 1.1
 */

define(
    [
        "jquery",
        "triple_brain.mind-map_template",
        "triple_brain.event_bus",
        "jquery.colorbox"
    ],
    function ($, MindMapTemplate, EventBus) {
        var api = {}
        api.ofVertex = function (vertex) {
            return new ImageMenu(vertex);
        };
        return api;

        function ImageMenu(vertex) {
            var imageMenu = this;
            var html;
            var isLastFeaturedImageLoaded = true;
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
                if(isLastFeaturedImageLoaded){
                    EventBus.publish(
                        "/event/ui/graph/vertex/image/about_to_load",
                        vertex
                    );
                }
                isLastFeaturedImageLoaded = false;
                images = imagesInOrderThatPrioritizeUserUploadedImages(images);
                var newFeaturedImage = images[0];
                var image = $(MindMapTemplate["image_container_image"].merge({
                        src:newFeaturedImage.getUrlForSmall()
                    }
                ));
                html.empty().append(
                    image
                );
                image.load(function () {
                    setUpBiggerImagesView();
                    /*
                        adjustWidth should be sufficient but display is better
                          when calling readjustLabelWidth() which adjust label width
                          call vertex.adjustWidth() afterwards
                     */
                    vertex.readjustLabelWidth();
                    EventBus.publish(
                        "/event/ui/graph/vertex/image/updated",
                        vertex
                    );
                    isLastFeaturedImageLoaded = true;
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

            this.isDoneLoadingImage = function(){
                return isLastFeaturedImageLoaded;
            };

            this.width = function () {
                return $(html).width();
            }

            function addHtmlToVertex() {
                vertex.hasMoveButton() ?
                    vertex.moveButton().after(html) :
                    vertex.getHtml().prepend(html);
            }

            function imagesInOrderThatPrioritizeUserUploadedImages(images){
                return images.sort(function(image1, image2){
                    var isImage1UploadedByUser = image1.isUploadedByUser();
                    var isImage2UploadedByUser = image2.isUploadedByUser();
                    if(isImage1UploadedByUser && isImage2UploadedByUser){
                        return 0;
                    }else if(isImage1UploadedByUser){
                        return -1;
                    }else{
                        return 1;
                    }
                });
            }
        }

    }
);