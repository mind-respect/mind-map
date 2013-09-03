define([

],
    function () {
        var api = {};
        api.withSmallAndBiggerImagesUrl = function(urlForSmall, urlForBigger){
            return new Image(urlForSmall, urlForBigger);
        };
        api.fromServerJson = function(imageAsServerJson){
            return new Image(
                imageAsServerJson.small_image_url,
                imageAsServerJson.bigger_image_url
            );
        };
        api.arrayFromServerJson = function(imagesAsServerJson){
            var images = [];
            $.each(imagesAsServerJson, function(){
                var imageAsJson = this;
                images.push(
                    api.fromServerJson(imageAsJson)
                );
            })
            return images;
        };
        api.fromInternalImageBaseUri = function(imageBaseUri){
            return new Image(
                imageBaseUri + "small",
                imageBaseUri + "big"
            );
        };
        return api;
        function Image(urlForSmall, urlForBigger){
            var thisImage = this;
            this.getUrlForSmall = function(){
                return urlForSmall;
            }
            this.getUrlForBigger = function(){
                return urlForBigger;
            }
            this.serverFormat = function(){
                return $.toJSON(
                    thisImage.jsonFormat()
                );
            }
            this.jsonFormat = function(){
                return {
                    url_for_small : thisImage.getUrlForSmall(),
                    url_for_bigger : thisImage.getUrlForBigger()
                }
            }
        }
    }
);