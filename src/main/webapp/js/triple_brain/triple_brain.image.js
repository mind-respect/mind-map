/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([],
    function () {
        var api = {};
        api.fromServerJson = function (imageAsServerJson) {
            return new Image(
                imageAsServerJson.base64ForSmall,
                imageAsServerJson.urlForBigger
            );
        };
        api.arrayFromServerJson = function (imagesAsServerJson) {
            var images = [];
            $.each(imagesAsServerJson, function () {
                var imageAsJson = this;
                images.push(
                    api.fromServerJson(imageAsJson)
                );
            });
            return images;
        };
        api.withBase64ForSmallAndUrlForBigger = function(base64ForSmall, urlForBigger){
            return new Image(
                base64ForSmall,
                urlForBigger
            );
        };
        api.getBase64OfExternalUrl = function (url, callback) {
            var img = $("<img>")
                .attr(
                "crossOrigin",
                "Anonymous"
            ).appendTo("body").load(function () {
                    callback(
                        getBase64Image(this)
                    );
                }
            ).prop(
                "src",
                url
            );
        };
        return api;
        function getBase64Image(imgElem) {
            var canvas = document.createElement("canvas");
            canvas.width = imgElem.clientWidth;
            canvas.height = imgElem.clientHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(imgElem, 0, 0);
            imgElem.crossOrigin = '';
            var dataURL = canvas.toDataURL("image/png");
            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        }

        function Image(base64ForSmall, urlForBigger) {
            var self = this;
            this.isUploadedByUser = function () {
                return self.getUrlForBigger().indexOf(
                    window.location.hostname
                ) != -1;
            };
            this.getBase64ForSmall = function () {
                return "data:application/octet-stream;base64," + base64ForSmall;
            };
            this.getUrlForBigger = function () {
                return urlForBigger;
            };
            this.serverFormat = function () {
                return $.toJSON(
                    self.jsonFormat()
                );
            };
            this.jsonFormat = function () {
                return {
                    base64ForSmall: base64ForSmall,
                    urlForBigger: self.getUrlForBigger()
                };
            };
            this.isEqualTo = function (image) {
                return self.getUrlForBigger() === image.getUrlForBigger();
            };
        }
    }
);