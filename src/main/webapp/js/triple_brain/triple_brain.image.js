define([
    "triple_brain.image"
],
    function () {
        var api = {};
        api.fromServerJson = function(imageAsServerJson){
            return new Image(
                imageAsServerJson.base64ForSmall,
                imageAsServerJson.urlForBigger
            );
        };
        api.arrayFromServerJson = function(imagesAsServerJson){
            var images = [];
            $.each(imagesAsServerJson, function(){
                var imageAsJson = this;
                images.push(
                    api.fromServerJson(imageAsJson)
                );
            });
            return images;
        };
        return api;
        function Image(base64ForSmall, urlForBigger){
            var self = this;
            this.isUploadedByUser = function(){
                return self.getUrlForBigger().indexOf(
                    window.location.hostname
                ) != -1;
            };
            this.getBase64ForSmall = function(){
                return "data:application/octet-stream;base64," + base64ForSmall;
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
                    url_for_small : self.getBase64ForSmall(),
                    url_for_bigger : self.getUrlForBigger()
                }
            };
            this.isEqualTo = function(image){
                return self.getUrlForBigger() === image.getUrlForBigger();
            };
        }
    }
);