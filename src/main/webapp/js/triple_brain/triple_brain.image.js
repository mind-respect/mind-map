define([

],
    function () {
        var api = {};
        api.withSmallAndBiggerImagesUrl = function(urlForSmall, urlForBigger){
            return new Image(urlForSmall, urlForBigger);
        }
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