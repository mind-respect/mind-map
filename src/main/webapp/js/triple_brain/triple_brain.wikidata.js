/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.wikidata_uri",
    "triple_brain.image",
    "triple_brain.event_bus"
], function (WikidataUri, Image, EventBus) {
    "use strict";
    var api = {};
    EventBus.before(
        '/event/ui/graph/before/identification/added',
        beforeIdentificationAdded
    );
    api.getImageForWikidataUri = function (wikidataUri) {
        var deferred = $.Deferred();
        var wikidataId = WikidataUri.idInWikidataUri(
            wikidataUri
        );
        var url = WikidataUri.BASE_URL + "/w/api.php?action=wbgetentities&ids=" +
            wikidataId + "&languages=en&props=claims&format=json";
        $.ajax({
            type: 'GET',
            dataType: "jsonp",
            url: url
        }).then(function (result) {
            return imageFromSearchResult(result, wikidataId);
        }).then(function (image) {
            deferred.resolve(image);
        });
        return deferred.promise();
    };
    function imageFromSearchResult(result, wikidataId) {
        var deferred = $.Deferred();
        var claims = result.entities[wikidataId].claims;
        if (claims === undefined) {
            deferred.resolve();
            return;
        }
        var imageRelation = claims.P18;
        if (imageRelation === undefined) {
            deferred.resolve();
            return;
        }
        var imageName = imageRelation[0].mainsnak.datavalue.value;
        var thumbUrl = WikidataUri.thumbUrlForImageName(imageName);
        Image.getBase64OfExternalUrl(
            thumbUrl
        ).then(function (imageBase64) {
                deferred.resolve(
                    Image.withBase64ForSmallAndUrlForBigger(
                        imageBase64,
                        WikidataUri.rawImageUrlFromThumbUrl(thumbUrl)
                    )
                );
            });
        return deferred.promise();
    }

    function beforeIdentificationAdded(graphElement, identification) {
        if (identification.hasImages()) {
            return;
        }
        api.getImageForWikidataUri(identification.getUri()).then(function (image) {
            if(image === undefined) {
                return;
            }
            identification.addImage(image);
            graphElement.addImages([image]);
            graphElement.refreshImages();
        });
    }

    return api;
});