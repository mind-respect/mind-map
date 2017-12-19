/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.identification",
    "triple_brain.id_uri",
    "mr.wikidata_uri",
    "mr.wikidata"
], function ($, FriendlyResource, Identification, IdUri, WikidataUri, Wikidata) {
    "use strict";
    var api = {};
    api.sortCompare = function (a, b, childrenIndex) {
        if (a.getIndex(childrenIndex) === b.getIndex(childrenIndex)) {
            if (a.getCreationDate() === b.getCreationDate()) {
                return 0;
            }
            if (a.getCreationDate() < b.getCreationDate()) {
                return -1;
            }
            return 1;
        }
        if (a.getIndex(childrenIndex) > b.getIndex(childrenIndex)) {
            return 1;
        }
        return -1;
    };
    api.fromServerFormat = function (serverFormat) {
        return new api.GraphElement().init(
            serverFormat
        );
    };
    api.buildServerFormatFromUi = function (graphElementUi) {
        return {
            friendlyResource: FriendlyResource.buildServerFormatFromUi(
                graphElementUi
            ),
            identifications: Identification.getServerFormatArrayFromFacadeArray(
                graphElementUi.getModel().getIdentifiers()
            )
        };
    };
    api.fromSuggestionAndElementUri = function (suggestion, elementUri) {
        var serverFormat = api.buildObjectWithUri(
            elementUri
        );
        serverFormat.identifications = [];
        var sameAs = suggestion.getSameAs();
        sameAs.makeSameAs();
        serverFormat.identifications.push(
            sameAs.getServerFormat()
        );
        if (suggestion.hasType()) {
            var type = suggestion.getType();
            type.makeType();
            serverFormat.identifications.push(
                type.getServerFormat()
            );
        }
        return api.fromServerFormat(
            serverFormat
        );
    };
    api.withUri = function (uri) {
        return api.fromServerFormat(
            api.buildObjectWithUri(
                uri
            )
        );
    };
    api.buildObjectWithUri = function (uri) {
        return {
            friendlyResource: FriendlyResource.buildObjectWithUri(
                uri
            )
        };
    };
    api.fromDetailedSearchResult = function (detailedSearchResult) {
        return api.fromServerFormat(
            detailedSearchResult.graphElement
        );
    };
    api.GraphElement = function () {
    };

    api.GraphElement.prototype = new FriendlyResource.FriendlyResource();

    api.GraphElement.prototype.init = function (graphElementServerFormat) {
        this.graphElementServerFormat = graphElementServerFormat;
        FriendlyResource.FriendlyResource.apply(
            this
        );
        FriendlyResource.FriendlyResource.prototype.init.call(
            this,
            graphElementServerFormat.friendlyResource
        );
        if(this.graphElementServerFormat.childrenIndex){
            this.graphElementServerFormat.childrenIndex = JSON.parse(
                this.graphElementServerFormat.childrenIndex
            );
        }
        this._buildIdentifications();
        // this.wikipediaLinksPromise = this._buildWikidataLinks();
        return this;
    };


    api.GraphElement.prototype.removeIdentifier = function (identifierToRemove) {
        var i = 0;
        this.identifiers.forEach(function (identifier) {
            if (identifier.getUri() === identifierToRemove.getUri()) {
                this.identifiers.splice(i, 1);
                return false;
            }
            i++;
        }.bind(this));
        return this.identifiers;
    };

    api.GraphElement.prototype.hasIdentifications = function () {
        return this.getIdentifiers().length > 0;
    };
    api.GraphElement.prototype.hasAllIdentifiers = function (identifiers) {
        var has = true;
        identifiers.forEach(function (identifier) {
            if (!this.hasIdentification(identifier)) {
                has = false;
            }
        }.bind(this));
        return has;
    };
    api.GraphElement.prototype.getIdentifierHavingExternalUri = function (externalUri) {
        var identification = false;
        $.each(this.getIdentifiers(), function () {
            if (this.getExternalResourceUri() === externalUri) {
                identification = this;
                return false;
            }
        });
        return identification;
    };

    api.GraphElement.prototype.getIdentifiers = function () {
        var identifiers = [];
        this.identifiers.forEach(function (identifier) {
            if (identifier.getExternalResourceUri() !== this.getUri()) {
                return identifiers.push(identifier);
            }
        }.bind(this));
        return identifiers;
    };

    api.GraphElement.prototype.getIdentifiersIncludingSelf = function () {
        var identifiers = this.getIdentifiers();
        var selfIdentifier = this.buildSelfIdentifier();
        if (!this.hasIdentification(selfIdentifier)) {
            identifiers.push(selfIdentifier);
        }
        return identifiers;
    };

    api.GraphElement.prototype._buildIdentifications = function () {
        this.identifiers = [];
        if (undefined === this.graphElementServerFormat.identifications) {
            return;
        }
        var self = this;
        $.each(this.graphElementServerFormat.identifications, function () {
            self.identifiers.push(Identification.fromServerFormat(
                this
            ));
        });
    };
    api.GraphElement.prototype.hasIdentification = function (identification) {
        var contains = false;
        $.each(this.getIdentifiers(), function () {
            if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
                contains = true;
                return false;
            }
        });
        return contains;
    };

    api.GraphElement.prototype.buildSelfIdentifier = function () {
        var identification = Identification.fromFriendlyResource(
            this
        );
        identification.setLabel(
            this.getLabel()
        );
        identification.setComment(
            this.getComment()
        );
        return identification;
    };

    api.GraphElement.prototype.buildTwiceSelfIdentifier = function () {
        var identification = Identification.fromFriendlyResource(
            this
        );
        identification.makeExternalUriATwiceReference();
        identification.setLabel(
            this.getLabel()
        );
        identification.setComment(
            this.getComment()
        );
        return identification;
    };

    api.GraphElement.prototype.isRelatedToIdentifier = function (identification) {
        return identification.getExternalResourceUri() === this.getUri() ||
            this.hasIdentification(identification);
    };

    api.GraphElement.prototype.addIdentifications = function (identifications) {
        var self = this;
        $.each(identifications, function () {
            self.addIdentification(
                this
            );
        });
    };
    api.GraphElement.prototype.addIdentification = function (identification) {
        if (this.hasIdentification(identification)) {
            return;
        }
        if (!identification.hasRelationExternalUri()) {
            return this.addIdentification(
                identification.makeGeneric()
            );
        }
        this.identifiers.push(identification);
    };

    api.GraphElement.prototype.getFirstIdentificationToAGraphElement = function () {
        var identification = false;
        $.each(this.getIdentifiersIncludingSelf(), function () {
            if (IdUri.isUriOfAGraphElement(this.getExternalResourceUri())) {
                identification = this;
                return false;
            }
        });
        return identification;
    };

    api.GraphElement.prototype.setSortDate = function (sortDate) {
        this.graphElementServerFormat.sortDate = sortDate.getTime();
        this.graphElementServerFormat.moveDate = new Date().getTime();
    };

    api.GraphElement.prototype.getSortDate = function () {
        if (undefined === this.graphElementServerFormat.sortDate) {
            return this.getCreationDate();
        }
        return new Date(
            this.graphElementServerFormat.sortDate
        );
    };

    api.GraphElement.prototype.getIndex = function (parentChildrenIndex) {
        if(!parentChildrenIndex[this.getUri()]){
            return -1;
        }
        return parentChildrenIndex[this.getUri()].index;
    };

    api.GraphElement.prototype.getChildrenIndex = function () {
        return this.graphElementServerFormat.childrenIndex || {};
    };

    api.GraphElement.prototype.getMoveDate = function () {
        if (undefined === this.graphElementServerFormat.moveDate) {
            return this.getCreationDate();
        }
        return new Date(
            this.graphElementServerFormat.moveDate
        );
    };

    api.GraphElement.prototype.isPristine = function () {
        return this.isLabelEmpty() && !this.hasIdentifications();
    };

    // api.GraphElement.prototype._buildWikidataLinks = function () {
    //     var promises = [];
    //     this.getIdentifiers().forEach(function (identifier) {
    //         var uri = identifier.getExternalResourceUri();
    //         if (!WikidataUri.isAWikidataUri(uri)) {
    //             return;
    //         }
    //         promises.push(Wikidata.getWikipediaUrlFromWikidataUri(uri));
    //     });
    //     return $.when.apply($, promises).then(function(){
    //         return Array.from(arguments);
    //     });
    // };
    //
    // api.GraphElement.prototype.getWikipediaLinks = function () {
    //     return this.wikipediaLinksPromise;
    // };

    return api;
});