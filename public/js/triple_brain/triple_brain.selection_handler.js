/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_ui",
    "triple_brain.scroll_on_mouse_frontier",
    "triple_brain.ui_utils",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    'jquery.performance'
], function ($, GraphUi, ScrollOnMouseFrontier, UiUtils, GraphDisplayer, EventBus) {
    "use strict";
    var api = {};
    var selectedRelations = [];
    var selectedVertices = [];

    api.selectAllVerticesOnly = function(){
        GraphUi.getDrawnGraph().detachTemp();
        deselectAll();
        var onlyPrepare = true;
        GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
            api.addVertex(vertex, onlyPrepare);
        });
        GraphUi.getDrawnGraph().reattach();
        api.reflectSelectionChange();
    };

    api.selectAllRelationsOnly = function(){
        GraphUi.getDrawnGraph().detachTemp();
        deselectAll();
        var onlyPrepare = true;
        GraphDisplayer.getEdgeSelector().visitAllEdges(function(edge){
            api.addRelation(edge, onlyPrepare);
        });
        GraphUi.getDrawnGraph().reattach();
        api.reflectSelectionChange();
    };

    api.setToSingleGraphElement = function (graphElement) {
        api._getSetterFromGraphElement(
            graphElement
        )(graphElement);
        centerBubbleIfApplicable(graphElement);
    };

    api._getSetterFromGraphElement = function(graphElement){
        return graphElement.isEdge() ?
            api.setToSingleRelation :
            api.setToSingleVertex;
    };

    api.setToSingleVertex = function (vertex) {
        deselectAll();
        api.addVertex(vertex);
        vertex.makeSingleSelected();
        api.reflectSelectionChange();
    };

    api.setToSingleRelation = function (relation) {
        deselectAll();
        api.addRelation(relation);
        relation.makeSingleSelected();
        api.reflectSelectionChange();
    };

    api.addGraphElement = function (graphElement, onlyPrepare) {
        onlyPrepare = onlyPrepare || false;
        api._getAdderFromGraphElement(graphElement)(
            graphElement, onlyPrepare
        );
    };

    api._getAdderFromGraphElement = function(graphElement){
        if(graphElement.isEdge()){
            return api.addRelation;
        }
        return api.addVertex;
    };

    api.addRelation = function (relation, onlyPrepare) {
        if(api.isOnlyASingleBubbleSelected()){
            api.getSingleElement().removeSingleSelected();
        }
        relation.select();
        selectedRelations.push(relation);
        if(!onlyPrepare){
            api.reflectSelectionChange();
        }
    };

    api.addVertex = function (vertex, onlyPrepare) {
        if(api.isOnlyASingleBubbleSelected()){
            api.getSingleElement().removeSingleSelected();
        }
        vertex.select();
        selectedVertices.push(vertex);
        if(!onlyPrepare){
            api.reflectSelectionChange();
        }
    };
    api.removeVertex = function (vertex) {
        deselectGraphElement(vertex, selectedVertices);
        api.reflectSelectionChange();
    };
    api.removeRelation = function (relation) {
        deselectGraphElement(relation, selectedRelations);
        api.reflectSelectionChange();
    };

    api.removeAll = function () {
        deselectAll();
        api.reflectSelectionChange();
    };

    api.getSelectedVertices = function () {
        return selectedVertices;
    };

    api.handleSelectionManagementClick = function (event) {
        event.preventDefault();
    };

    api.getNbSelectedVertices = function () {
        return selectedVertices.length;
    };
    api.getNbSelectedRelations = function () {
        return selectedRelations.length;
    };
    api.getOneOrArrayOfSelected = function () {
        return 1 === api.getNbSelected() ?
            api.getSingleElement() : api.getSelectedElements();
    };
    api.getSingleElement = function () {
        return api.getSelectedBubbles()[0];
    };
    api.getSelectedElements = api.getSelectedBubbles = function(){
        return selectedRelations.concat(
            selectedVertices
        );
    };
    api.getNbSelected = api.getNbSelectedElements = function(){
        return selectedVertices.length + selectedRelations.length;
    };
    api.isOnlyASingleBubbleSelected = api.isOnlyASingleElementSelected = function(){
        return 1 === api.getNbSelectedElements();
    };

    api.reflectSelectionChange = function() {
        EventBus.publish(
            "/event/ui/selection/changed",
            api
        );
    };
    EventBus.subscribe("/event/ui/graph/reset", deselectAll);
    return api;

    function centerBubbleIfApplicable(bubble) {
        var html = bubble.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            html.centerOnScreenWithAnimation();
        }
    }

    function deselectAll() {
        api.getSelectedElements().forEach(function(graphElement){
            graphElement.deselect();
        });
        selectedVertices = [];
        selectedRelations = [];
    }

    function deselectGraphElement(toDeselect, graphElements){
        toDeselect.deselect();
        var uriToRemove = toDeselect.getUri();
        for (var i = graphElements.length - 1; i >= 0; i--) {
            if (uriToRemove === graphElements[i].getUri()) {
                graphElements.splice(i, 1);
                return;
            }
        }
    }
});