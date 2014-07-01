/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
],function($, EventBus, GraphDisplayer){
    var api = {};
    api.types = {
        "CONCEPT" : "concept",
        "RELATION" : "relation"
    };
    api.Object = function(html){
        var self = this;
        this.removeType = function (type) {
            var types = self.removeIdenficationInArray(
                type,
                self.getTypes()
            );
            html.data("types", types);
            self.removeIdentificationCommonBehavior(type);
        };

        this.removeIdenficationInArray = function (identificationToRemove, array) {
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

        this.getTypes = function () {
            return html.data('types');
        };
        this.getIdentifications = function () {
            return self.getTypes().concat(
                self.getSameAs(),
                self.getGenericIdentifications()
            );
        };
        this.setGenericIdentifications = function (genericIdentifications){
            html.data(
                'genericIdentifications',
                genericIdentifications
            );
        };
        this.getGenericIdentifications = function(){
            return html.data(
                'genericIdentifications'
            );
        };
        this.addGenericIdentification = function (genericIdentification) {
            genericIdentification.setType("generic");
            var genericIdentifications = self.getGenericIdentifications();
            genericIdentifications.push(genericIdentification);
            self.setGenericIdentifications(
                genericIdentifications
            );
            self.applyCommonBehaviorForAddedIdentification(genericIdentification);
        };
        this.removeGenericIdentification = function (genericIdentification) {
            var genericIdentifications = self.removeIdenficationInArray(
                genericIdentification,
                self.getGenericIdentifications()
            );
            self.setGenericIdentifications(
                genericIdentifications
            );
            self.removeIdentificationCommonBehavior(genericIdentification);
        };
        this.setTypes = function (types) {
            return html.data('types', types);
        };
        this.addType = function (type) {
            type.setType("type");
            var types = self.getTypes();
            types.push(type);
            self.setTypes(types);
            self.applyCommonBehaviorForAddedIdentification(type);
        };
        this.addSameAs = function (sameAs) {
            sameAs.setType("same_as");
            var sameAsCollection = self.getSameAs();
            sameAsCollection.push(sameAs);
            self.setSameAs(sameAsCollection);
            self.applyCommonBehaviorForAddedIdentification(sameAs);
        };
        this.setSameAs = function (sameAsCollection) {
            html.data('sameAs', sameAsCollection);
        };
        this.getSameAs = function () {
            return $(html).data('sameAs');
        };
        this.removeSameAs = function (sameAsToRemove) {
            var sameAs = self.removeIdenficationInArray(
                sameAsToRemove,
                self.getSameAs()
            );
            html.data("sameAs", sameAs);
            self.removeIdentificationCommonBehavior(sameAsToRemove);
        };
        this.isConcept = function(){
            return self.getGraphElementType() === api.types.CONCEPT;
        };
    };
    EventBus.subscribe("/event/ui/selection/changed",
        function (event, selectionInfo) {
            var onlyOneGraphElementSelected = 1 === selectionInfo.getNbSelected();
            if(!onlyOneGraphElementSelected){
                $.each(selectionInfo.getSelectedElements(), function(){
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
    function displayOnlyRelevantButtonsInGraphElementMenu(graphElement){
        var clickHandler = graphElement.isConcept() ?
            GraphDisplayer.getVertexMenuHandler().forSingle() :
            GraphDisplayer.getRelationMenuHandler().forSingle();
        graphElement.visitMenuButtons(function(button){
            button.showOnlyIfApplicable(
                clickHandler,
                graphElement
            );
        });
    }
});