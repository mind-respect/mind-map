/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.bubble",
    "triple_brain.id_uri"
], function ($, GraphDisplayer, Bubble, IdUri) {
    "use strict";
    var api = {};
    api.Object = function (html) {
        this.html = html;
    };
    api.Object.prototype = new Bubble.Self();
    api.Object.prototype.removeType = function (type) {
        var types = this.removeIdentificationInArray(
            type,
            this.getTypes()
        );
        this.html.data("types", types);
        this.impactOnRemovedIdentification(type);
    };

    api.Object.prototype.removeIdentificationInArray = function (identificationToRemove, array) {
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

    api.Object.prototype.getTypes = function () {
        if (this.html.data('types') === undefined) {
            this.html.data('types', []);
        }
        return this.html.data('types');
    };
    api.Object.prototype.getIdentifications = function () {
        return this.getTypes().concat(
            this.getSameAs(),
            this.getGenericIdentifications()
        );
    };
    api.Object.prototype.getFirstIdentificationToAGraphElement = function () {
        var identification = false;
        $.each(this.getIdentifications(), function () {
            if (IdUri.isUriOfAGraphElement(this.getExternalResourceUri())) {
                identification = this;
                return false;
            }
        });
        return identification;
    };
    api.Object.prototype.setGenericIdentifications = function (genericIdentifications) {
        this.html.data(
            'genericIdentifications',
            genericIdentifications
        );
    };
    api.Object.prototype.getGenericIdentifications = function () {
        if (this.html.data('genericIdentifications') === undefined) {
            this.html.data('genericIdentifications', []);
        }
        return this.html.data(
            'genericIdentifications'
        );
    };
    api.Object.prototype.addGenericIdentification = function (genericIdentification) {
        genericIdentification.setType("generic");
        var genericIdentifications = this.getGenericIdentifications();
        genericIdentifications.push(genericIdentification);
        this.setGenericIdentifications(
            genericIdentifications
        );
        this.integrateIdentification(genericIdentification);
    };
    api.Object.prototype.removeGenericIdentification = function (genericIdentification) {
        var genericIdentifications = this.removeIdentificationInArray(
            genericIdentification,
            this.getGenericIdentifications()
        );
        this.setGenericIdentifications(
            genericIdentifications
        );
        this.impactOnRemovedIdentification(genericIdentification);
    };
    api.Object.prototype.setTypes = function (types) {
        return this.html.data('types', types);
    };
    api.Object.prototype.addType = function (type) {
        type.setType("type");
        var types = this.getTypes();
        types.push(type);
        this.setTypes(types);
        this.integrateIdentification(type);
    };
    api.Object.prototype.addSameAs = function (sameAs) {
        sameAs.setType("same_as");
        var sameAsCollection = this.getSameAs();
        sameAsCollection.push(sameAs);
        this.setSameAs(sameAsCollection);
        this.integrateIdentification(sameAs);
    };
    api.Object.prototype.setSameAs = function (sameAsCollection) {
        this.html.data('sameAs', sameAsCollection);
    };
    api.Object.prototype.getSameAs = function () {
        if (this.html.data('sameAs') === undefined) {
            this.html.data('sameAs', []);
        }
        return this.html.data('sameAs');
    };
    api.Object.prototype.removeSameAs = function (sameAsToRemove) {
        var sameAs = this.removeIdentificationInArray(
            sameAsToRemove,
            this.getSameAs()
        );
        this.html.data("sameAs", sameAs);
        this.impactOnRemovedIdentification(sameAsToRemove);
    };
    api.Object.prototype.hasIdentifications = function () {
        return this.getIdentifications().length > 0;
    };
    api.Object.prototype.hasIdentification = function (identification) {
        var contains = false;
        $.each(this.getIdentifications(), function () {
            if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
                contains = true;
                return false;
            }
        });
        return contains;
    };
    api.Object.prototype.hasSearchResultAsIdentification = function (searchResult) {
        var hasIdentification = false;
        $.each(this.getIdentifications(), function () {
            var identification = this;
            if (searchResult.uri === identification.getExternalResourceUri()) {
                hasIdentification = true;
                return false;
            }
        });
        return hasIdentification;
    };
    return api;
});