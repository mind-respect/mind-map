/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.scroll_on_mouse_frontier",
    "triple_brain.ui.utils",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "jquery-ui"
], function ($, GraphUi, ScrollOnMouseFrontier, UiUtils, GraphDisplayer, EventBus) {
    "use strict";
    var api = {},
        _selectBox,
        SELECT_BOX_MIN_WIDTH = 45,
        SELECT_BOX_MIN_HEIGHT = 40,
        selectionInfo = new SelectionInfo();

    api.selectAllBubblesOnly = function(){
        deselectAll();
        selectionInfo.removeAll();
        GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
            api.addVertex(vertex);
        });
        reflectSelectionChange();
    };

    api.selectAllRelationsOnly = function(){
        deselectAll();
        selectionInfo.removeAll();
        GraphDisplayer.getEdgeSelector().visitAllEdges(function(edge){
            api.addRelation(edge);
        });
        reflectSelectionChange();
    };

    api.setToSingleGraphElement = function (graphElement) {
        var setter = graphElement.rightActionForType(
            api.setToSingleVertex,
            api.setToSingleRelation,
            api.setToSingleGroupRelation,
            api.setToSingleVertex,
            api.setToSingleRelation,
            api.setToSingleVertex,
            api.setToSingleRelation
        );
        setter(graphElement);
        centerBubbleIfApplicable(graphElement);
    };

    api.setToSingleGroupRelation = function (groupRelation) {
        deselectAll();
        selectionInfo.setToSingleGroupRelation(groupRelation);
        groupRelation.select();
        groupRelation.makeSingleSelected();
        reflectSelectionChange();
    };

    api.setToSingleVertex = function (vertex) {
        deselectAll();
        selectionInfo.setToSingleVertex(vertex);
        vertex.select();
        vertex.makeSingleSelected();
        reflectSelectionChange();
    };

    api.setToSingleRelation = function (relation) {
        deselectAll();
        selectionInfo.setToSingleRelation(relation);
        relation.select();
        relation.makeSingleSelected();
        reflectSelectionChange();
    };

    api.addGroupRelation = function (groupRelation) {
        groupRelation.select();
        selectionInfo.addGroupRelation(groupRelation);
        reflectSelectionChange();
    };

    api.addRelation = function (relation) {
        relation.select();
        selectionInfo.addRelation(relation);
        reflectSelectionChange();
    };

    api.addVertex = function (vertex) {
        vertex.select();
        selectionInfo.addVertex(vertex);
        reflectSelectionChange();
    };
    api.removeVertex = function (vertex) {
        vertex.deselect();
        selectionInfo.removeVertex(vertex);
        reflectSelectionChange();
    };
    api.removeRelation = function (relation) {
        relation.deselect();
        selectionInfo.removeRelation(relation);
        reflectSelectionChange();
    };

    api.removeAll = function () {
        deselectAll();
        selectionInfo.removeAll();
        reflectSelectionChange();
    };

    api.getSelectedVertices = function () {
        return selectionInfo.getSelectedVertices();
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
        ).removeDragScroll();
    };

    api.isOnlyASingleBubbleSelected = function () {
        return (1 === selectionInfo.getNbSelectedBubbles()) &&
            0 === api.getNbSelectedRelations();
    };
    api.getNbSelected = function () {
        return selectionInfo.getNbSelected();
    };

    api.getNbSelectedVertices = function () {
        return selectionInfo.getNbSelectedVertices();
    };
    api.getNbSelectedRelations = function () {
        return selectionInfo.getNbSelectedRelations();
    };
    api.getOneOrArrayOfSelected = function () {
        return 1 === api.getNbSelected() ?
            api.getSingleElement() : api.getSelectedElements()
    };
    api.getSelectedElements = function () {
        return selectionInfo.getSelectedElements();
    };
    api.getSingleElement = function () {
        return selectionInfo.getSingleElement();
    };
    api.getSelectedBubbles = function(){
        return selectionInfo.getSelectedBubbles();
    };
    api.getNbSelectedElements = function(){
        return selectionInfo.getNbSelectedElements();
    };
    api.isOnlyASingleElementSelected = function(){
        return selectionInfo.getNbSelectedElements() === 1;
    };
    EventBus.subscribe("/event/ui/graph/reset", selectionInfo.removeAll);
    return api;
    function centerBubbleIfApplicable(bubble) {
        var html = bubble.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            html.centerOnScreenWithAnimation();
        }
    }
    function reflectSelectionChange() {
        var nbSelectedGraphElements = selectionInfo.getNbSelected();
        if (0 === nbSelectedGraphElements) {
            EventBus.publish(
                "/event/ui/selection/changed",
                selectionInfo
            );
            return;
        }
        EventBus.publish(
            "/event/ui/selection/changed",
            selectionInfo
        );
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
                    reflectSelectionChange();
                    mindMap.dragScroll();
                }
            }
        );
    }

    function deselectAll() {
        deselectGraphElements(
            selectionInfo.getSelectedVertices()
        );
        deselectGraphElements(
            selectionInfo.getSelectedRelations()
        );
        deselectGraphElements(
            selectionInfo.getSelectedGroupRelations()
        );
    }

    function deselectGraphElements(graphElements) {
        $.each(graphElements, function () {
            this.deselect();
        });
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

    function SelectionInfo() {
        var vertices = [],
            relations = [],
            groupRelations = [],
            self = this;
        this.setToSingleGroupRelation = function (groupRelation) {
            relations = [];
            vertices = [];
            groupRelations = [groupRelation];
        };
        this.setToSingleVertex = function (vertex) {
            relations = [];
            groupRelations = [];
            vertices = [vertex];
        };
        this.setToSingleRelation = function (relation) {
            vertices = [];
            groupRelations = [];
            relations = [relation];
        };
        this.removeAll = function () {
            vertices = [];
            relations = [];
            groupRelations = [];
        };
        this.addRelation = function (relation) {
            relations.push(relation);
        };
        this.addGroupRelation = function(groupRelation){
            groupRelations.push(groupRelation);
        };
        this.addVertex = function (vertex) {
            vertices.push(vertex);
        };
        this.removeVertex = function (vertex) {
            removeGraphElement(vertex, vertices);
        };
        this.removeRelation = function (relation) {
            removeGraphElement(relation, relations);
        };
        this.getNbSelected = function () {
            return vertices.length + relations.length + groupRelations.length;
        };
        this.getNbSelectedBubbles = function () {
            return self.getNbSelectedVertices() +
                self.getNbSelectedGroupRelations();
        };
        this.getSelectedBubbles = function(){
            return self.getSelectedVertices().concat(
                self.getSelectedGroupRelations()
            );
        };
        this.getNbSelectedVertices = function () {
            return vertices.length;
        };
        this.getNbSelectedRelations = function () {
            return relations.length;
        };
        this.getNbSelectedGroupRelations = function(){
            return groupRelations.length;
        };
        this.getSelectedVertices = function () {
            return vertices;
        };
        this.getSelectedRelations = function () {
            return relations;
        };
        this.getSelectedElements = function () {
            return vertices.concat(
                relations
            );
        };
        this.getSingleElement = function () {
            if(1 === self.getNbSelectedVertices()){
                return self.getSelectedVertices()[0];
            }else if(1 === self.getNbSelectedRelations()){
                return self.getSelectedRelations()[0];
            }else{
                return self.getSelectedGroupRelations()[0];
            }
        };
        this.getSelectedGroupRelations = function(){
            return groupRelations;
        };
        this.getSelectedGraphElements = function(){
            return self.getSelectedRelations().concat(
              self.getSelectedVertices()
            );
        };
        this.getNbSelectedGraphElements = function(){
            return self.getNbSelectedRelations() +
                self.getNbSelectedVertices();
        };
        this.getNbSelectedElements = function(){
            return self.getNbSelectedBubbles() + self.getNbSelectedRelations();
        };
        function removeGraphElement(toRemove, graphElements) {
            var uriToRemove = toRemove.getUri();
            for (var i = graphElements.length - 1; i >= 0; i--) {
                if (uriToRemove === graphElements[i].getUri()) {
                    graphElements.splice(i, 1);
                    return;
                }
            }
        }
    }
});