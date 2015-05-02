/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.bubble"
], function ($, GraphDisplayer, Bubble) {
    var api = {};
    api.Object = function (html) {
        this.html = html;
    };
    api.Object.prototype = new Bubble.Self;
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
        return this.html.data('types');
    };
    api.Object.prototype.getIdentifications = function () {
        return this.getTypes().concat(
            this.getSameAs(),
            this.getGenericIdentifications()
        );
    };
    api.Object.prototype.setGenericIdentifications = function (genericIdentifications) {
        this.html.data(
            'genericIdentifications',
            genericIdentifications
        );
    };
    api.Object.prototype.getGenericIdentifications = function () {
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
    api.Object.prototype.hasIdentifications = function(){
        return this.getIdentifications().length > 0;
    };
    return api;
});