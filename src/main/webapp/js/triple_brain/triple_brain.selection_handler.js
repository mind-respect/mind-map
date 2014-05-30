/*
 * Copyright Mozilla Public License 1.1
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
        selectBox,
        SELECT_BOX_MIN_WIDTH = 45,
        SELECT_BOX_MIN_HEIGHT = 40;

    api.reset = function () {
        GraphDisplayer.getVertexSelector().resetSelection();
        GraphDisplayer.getEdgeSelector().resetSelection();
        setNbSelectedGraphElements(0);
    };
    api.handleSelectionManagementClick = function (event) {
        event.preventDefault();
    };
    api.handleButtonClick = function () {
        removeSelectBoxIfExists();
        getMindMap().off(
            "click",
            activateSelectionOnMindMap
        ).on(
            "click",
            activateSelectionOnMindMap
        );
    };
    api.getSelectionManagementButton = function () {
        return $("#graph-elements-selected");
    };
    api.refreshSelectionMenu = function(){
        setNbSelectedGraphElements(
            api.getNbSelected()
        );
    };
    api.isOnlyASingleBubbleSelected = function(){
        return 1 === api.getNbSelectedBubbles() &&
            0 === api.getNbSelectedRelations();
    };
    api.getNbSelected = function(){
        return api.getSelectedBubbles().length + api.getSelectedRelations().length;
    };
    api.getNbSelectedBubbles = function(){
        return api.getSelectedBubbles().length;
    };
    api.getNbSelectedRelations = function(){
        return api.getSelectedRelations().length;
    };
    api.getSelectedBubbles = function(){
        var selected = [];
        GraphDisplayer.getVertexSelector().visitSelected(function(vertex){
            selected.push(
                vertex
            );
        });
        return selected;
    };
    api.getSelectedRelations = function(){
        var selected = [];
        GraphDisplayer.getEdgeSelector().visitSelected(function(edge){
            selected.push(
                edge
            );
        });
        return selected;
    };
    api.getSelectedElements = function(){
        var selectedRelations = api.getSelectedRelations();
        var selectedBubbles = api.getSelectedBubbles();
        var graphElements = selectedBubbles.concat(
            selectedRelations
        );
        if(1 === graphElements.length){
            return graphElements[0];
        }
        return graphElements;
    };
    return api;
    function getMindMap() {
        return $("svg.main");
    }
    function activateSelectionOnMindMap(event) {
        $(this).off(
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
                handles:"ne, se, sw, nw",
                containment:"document",
                start:ScrollOnMouseFrontier.doIt,
                stop:function () {
                    ScrollOnMouseFrontier.disable();
                    GraphDisplayer.getVertexSelector().resetSelection();
                    var nbSelected = 0;
                    GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                        if (UiUtils.doComponentsCollide(
                            vertex.getHtml(),
                            getSelectBox()
                        )) {
                            vertex.select();
                            nbSelected++;
                        }
                    });
                    removeSelectBoxIfExists();
                    setNbSelectedGraphElements(
                        api.getNbSelected()
                    );
                }
            }
        );
    }

    function removeSelectBoxIfExists() {
        getSelectBox().addClass("hidden");
    }

    function getSelectBox() {
        if(!selectBox){
            selectBox = $("#selection-box");
        }
        return selectBox;
    }

    function setNbSelectedGraphElements(nbSelectedGraphElements) {
        if (nbSelectedGraphElements === 0) {
            api.getSelectionManagementButton().hide();
            EventBus.publish(
                "/event/ui/selection/changed",
                [[]]
            );
            return;
        }
        api.getSelectionManagementButton().show();
        getWhereToPutNbSelectedGraphElements().text(
            nbSelectedGraphElements
        );
        EventBus.publish(
            "/event/ui/selection/changed",
            [api.getSelectedElements()]
        );
    }

    function getWhereToPutNbSelectedGraphElements() {
        return api.getSelectionManagementButton().find(".nb");
    }
});