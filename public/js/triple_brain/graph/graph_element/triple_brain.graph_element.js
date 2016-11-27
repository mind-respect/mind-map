/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.friendly_resource",
    "triple_brain.identification",
    "triple_brain.id_uri"
], function ($, FriendlyResource, Identification, IdUri) {
    "use strict";
    var api = {};
    api.sortCompare = function (a, b) {
        if (a.getSortDate() === b.getSortDate()) {
            if (a.getMoveDate() === b.getMoveDate()) {
                return 0;
            }
            if (a.getMoveDate() > b.getMoveDate()) {
                return -1;
            }
            return 1;
        }
        if (a.getSortDate() > b.getSortDate()) {
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
        sameAs.setType("same_as");
        serverFormat.identifications.push(
            sameAs.getServerFormat()
        );
        if (suggestion.hasType()) {
            var type = suggestion.getType();
            type.setType("type");
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
        this._buildIdentifications();
        return this;
    };


    api.GraphElement.prototype.removeIdentification = function (identification) {
        var removeAction = identification.rightActionForType(
            this.removeType,
            this.removeSameAs,
            this.removeGenericIdentification
        );
        removeAction.call(
            this,
            identification
        );
    };


    api.GraphElement.prototype.getTypes = function () {
        return this._types;
    };
    api.GraphElement.prototype.setTypes = function (types) {
        return this._types = types;
    };
    api.GraphElement.prototype.getSameAs = function () {
        return this._sameAs;
    };
    api.GraphElement.prototype.setSameAs = function (sameAs) {
        return this._sameAs = sameAs;
    };
    api.GraphElement.prototype.hasIdentifications = function () {
        return this.getIdentifiers().length > 0;
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
        var identifiers = [].concat(
            this._types
        ).concat(
            this._sameAs
        ).concat(
            this._genericIdentifications
        );
        var i = identifiers.length;
        while (i--) {
            if (identifiers[i].getExternalResourceUri() === this.getUri()) {
                identifiers.splice(i, 1);
            }
        }
        return identifiers;
    };

    api.GraphElement.prototype.getIdentifiersIncludingSelf = function () {
        var identifiers = this.getIdentifiers();
        var selfIdentifier = this._buildSelfIdentifier();
        if(!this.hasIdentification(selfIdentifier)){
            identifiers.push(selfIdentifier);
        }
        return identifiers;
    };

    api.GraphElement.prototype._buildIdentifications = function () {
        this._types = [];
        this._sameAs = [];
        this._genericIdentifications = [];
        if (undefined === this.graphElementServerFormat.identifications) {
            return;
        }
        var self = this;
        $.each(this.graphElementServerFormat.identifications, function () {
            var identification = Identification.fromServerFormat(
                this
            );
            switch (identification.getType()) {
                case "generic" :
                    self._genericIdentifications.push(identification);
                    return;
                case "type":
                    self._types.push(identification);
                    return;
                case "same_as":
                    self._sameAs.push(identification);
            }
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

    api.GraphElement.prototype._buildSelfIdentifier = function(){
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

    api.GraphElement.prototype.isRelatedToIdentification = function (identification) {
        return identification.getExternalResourceUri() === this.getUri() ||
            this.hasIdentification(identification);
    };

    api.GraphElement.prototype.addGenericIdentification = function (identification) {
        this._genericIdentifications.push(identification);
    };

    api.GraphElement.prototype.getGenericIdentifications = function () {
        return this._genericIdentifications;
    };

    api.GraphElement.prototype.setGenericIdentifications = function (genericIdentifications) {
        this._genericIdentifications = genericIdentifications;
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
        if(this.hasIdentification(identification)){
            return;
        }
        if (!identification.hasType()) {
            return this.addIdentification(
                identification.makeGeneric()
            );
        }
        var addAction = identification.rightActionForType(
            this.addType,
            this.addSameAs,
            this.addGenericIdentification
        );
        addAction.call(
            this,
            identification
        );
    };
    api.GraphElement.prototype.addSameAs = function (identification) {
        this._sameAs.push(identification);
    };
    api.GraphElement.prototype.addType = function (identification) {
        this._types.push(identification);
    };

    api.GraphElement.prototype.removeType = function (type) {
        this._types = this.removeIdentificationInArray(
            type,
            this.getTypes()
        );
    };

    api.GraphElement.prototype.removeSameAs = function (sameAs) {
        this._sameAs = this.removeIdentificationInArray(
            sameAs,
            this.getSameAs()
        );
    };

    api.GraphElement.prototype.removeGenericIdentification = function (generic) {
        this._genericIdentifications = this.removeIdentificationInArray(
            generic,
            this.getGenericIdentifications()
        );
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

    api.GraphElement.prototype.removeIdentificationInArray = function (identificationToRemove, array) {
        var i = 0;
        $.each(array, function () {
            var identification = this;
            if (identification.getUri() === identificationToRemove.getUri()) {
                array.splice(i, 1);
                return false;
            }
            i++;
        });
        return array;
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

    api.GraphElement.prototype.getMoveDate = function () {
        if (undefined === this.graphElementServerFormat.moveDate) {
            return this.getCreationDate();
        }
        return new Date(
            this.graphElementServerFormat.moveDate
        );
    };

    return api;
});