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
                imageBaseUri + "/small",
                imageBaseUri + "/big"
            );
        };
        return api;
        function Image(urlForSmall, urlForBigger){
            var self = this;
            this.isUploadedByUser = function(){
                return self.getUrlForSmall().indexOf(
                    window.location.hostname
                ) != -1;
            };
            this.getUrlForSmall = function(){
                return urlForSmall;
            };
            this.getUrlForBigger = function(){
                return urlForBigger;
            };
            this.serverFormat = function(){
                return $.toJSON(
                    self.jsonFormat()
                );
            };
            this.jsonFormat = function(){
                return {
                    url_for_small : self.getUrlForSmall(),
                    url_for_bigger : self.getUrlForBigger()
                }
            };
        }
    }
);