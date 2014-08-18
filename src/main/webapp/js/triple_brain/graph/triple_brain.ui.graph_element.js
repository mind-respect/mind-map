/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
], function ($, EventBus, GraphDisplayer) {
    var api = {};
    api.types = {
        "VERTEX": "vertex",
        "RELATION": "relation"
    };
    api.Object = function (html) {
        this.html = html;
    };
    api.Object.prototype.removeType = function (type) {
        var types = this.removeIdentificationInArray(
            type,
            this.getTypes()
        );
        this.html.data("types", types);
        this.removeIdentificationCommonBehavior(type);
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
        this.applyCommonBehaviorForAddedIdentification(genericIdentification);
    };
    api.Object.prototype.removeGenericIdentification = function (genericIdentification) {
        var genericIdentifications = this.removeIdentificationInArray(
            genericIdentification,
            this.getGenericIdentifications()
        );
        this.setGenericIdentifications(
            genericIdentifications
        );
        this.removeIdentificationCommonBehavior(genericIdentification);
    };
    api.Object.prototype.setTypes = function (types) {
        return this.html.data('types', types);
    };
    api.Object.prototype.addType = function (type) {
        type.setType("type");
        var types = this.getTypes();
        types.push(type);
        this.setTypes(types);
        this.applyCommonBehaviorForAddedIdentification(type);
    };
    api.Object.prototype.addSameAs = function (sameAs) {
        sameAs.setType("same_as");
        var sameAsCollection = this.getSameAs();
        sameAsCollection.push(sameAs);
        this.setSameAs(sameAsCollection);
        this.applyCommonBehaviorForAddedIdentification(sameAs);
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
        this.removeIdentificationCommonBehavior(sameAsToRemove);
    };
    api.Object.prototype.isVertex = function () {
        return this.getGraphElementType() === api.types.VERTEX;
    };
    api.Object.prototype.isRelation = function () {
        return this.getGraphElementType() === api.types.RELATION;
    };
    api.Object.prototype.isGroupRelation = function () {
        return false;
    };
    EventBus.subscribe("/event/ui/selection/changed",
        function (event, selectionInfo) {
            var onlyOneGraphElementSelected = 1 === selectionInfo.getNbSelectedGraphElements();
            if (!onlyOneGraphElementSelected) {
                $.each(selectionInfo.getSelectedGraphElements(), function () {
                    var selectedElement = this;
                    selectedElement.hideMenu();
                });
                return;
            }
            displayOnlyRelevantButtonsInGraphElementMenu(
                selectionInfo.getSingleElement()
            );
        }
    );
    return api;
    function displayOnlyRelevantButtonsInGraphElementMenu(graphElement) {
        var clickHandler = graphElement.isVertex() ?
            GraphDisplayer.getVertexMenuHandler().forSingle() :
            GraphDisplayer.getRelationMenuHandler().forSingle();
        graphElement.visitMenuButtons(function (button) {
            button.showOnlyIfApplicable(
                clickHandler,
                graphElement
            );
        });
    }
});