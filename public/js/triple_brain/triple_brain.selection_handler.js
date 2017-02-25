/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_ui",
    "triple_brain.scroll_on_mouse_frontier",
    "triple_brain.ui_utils",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus"
], function ($, GraphUi, ScrollOnMouseFrontier, UiUtils, GraphDisplayer, EventBus) {
    "use strict";
    var api = {},
        _selectBox,
        SELECT_BOX_MIN_WIDTH = 45,
        SELECT_BOX_MIN_HEIGHT = 40,
        selectedRelations = [],
        selectedVertices = [];

    api.selectAllBubblesOnly = function(){
        deselectAll();
        GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
            api.addVertex(vertex);
        });
        api.reflectSelectionChange();
    };

    api.selectAllRelationsOnly = function(){
        deselectAll();
        GraphDisplayer.getEdgeSelector().visitAllEdges(function(edge){
            api.addRelation(edge);
        });
        api.reflectSelectionChange();
    };

    api.setToSingleGraphElement = function (graphElement) {
        var setter = graphElement.rightActionForType(
            api.setToSingleVertex,
            api.setToSingleRelation,
            api.setToSingleRelation,
            api.setToSingleVertex,
            api.setToSingleRelation,
            api.setToSingleVertex,
            api.setToSingleRelation
        );
        setter(graphElement);
        centerBubbleIfApplicable(graphElement);
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
        var adder = graphElement.rightActionForType(
            api.addVertex,
            api.addRelation,
            api.addGroupRelation,
            api.addVertex,
            api.addRelation,
            api.addVertex,
            api.addRelation
        );
        adder(graphElement, onlyPrepare);
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
    api.handleButtonClick = function () {
        removeSelectBoxIfExists();
        GraphUi.getTopLayer().off(
            "click",
            activateSelectionOnMindMap
        ).on(
            "click",
            activateSelectionOnMindMap
        );
        GraphUi.disableDragScroll();
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
    function activateSelectionOnMindMap(event) {
        var mindMap = $(this).off(
            event
        );
        getSelectBox().removeClass("hidden").css(
            "width", SELECT_BOX_MIN_WIDTH
        ).css(
            "height", SELECT_BOX_MIN_WIDTH
        ).css(
            "left", event.pageX - SELECT_BOX_MIN_WIDTH / 2
        ).css(
            "top", event.pageY - SELECT_BOX_MIN_HEIGHT / 2
        ).resizable({
                handles: "ne, se, sw, nw",
                containment: "document",
                stop : function () {
                    ScrollOnMouseFrontier.disable();
                    api.removeAll();
                    GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                        if (UiUtils.doComponentsCollide(
                            vertex.getHtml(),
                            getSelectBox()
                        )) {
                            api.addVertex(vertex);
                        }
                    });
                    removeSelectBoxIfExists();
                    api.reflectSelectionChange();
                    GraphUi.enableDragScroll();
                }
            }
        );
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

    function removeSelectBoxIfExists() {
        getSelectBox().addClass("hidden");
    }

    function getSelectBox() {
        if (!_selectBox) {
            _selectBox = $("#selection-box");
        }
        return _selectBox;
    }
});