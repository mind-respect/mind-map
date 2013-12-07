/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.scroll_on_mouse_frontier",
    "triple_brain.ui.utils",
    "triple_brain.vertex",
    "triple_brain.graph_displayer",
    "triple_brain.ui.edge",
    "triple_brain.event_bus",
    "jquery-ui"
], function ($, GraphUi, ScrollOnMouseFrontier, UiUtils, VertexService, GraphDisplayer, EdgeUi, EventBus) {
    var api = {};
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
        $("body").addClass("select");
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
    api.handleGroupButtonClick = function () {
        var selectedGraphElements = {
            edges : {},
            vertices : {}
        };
        EdgeUi.visitAllEdges(function (edge) {
            var sourceVertex = edge.sourceVertex();
            var destinationVertex = edge.destinationVertex();
            var isSourceVertexSelected = sourceVertex.isSelected();
            var isDestinationVertexSelected = destinationVertex.isSelected();
            if (isSourceVertexSelected) {
                selectedGraphElements.vertices[
                    sourceVertex.getUri()
                    ] = ""
            }
            if (isDestinationVertexSelected) {
                selectedGraphElements.vertices[
                    destinationVertex.getUri()
                    ] = ""
            }
            if (isSourceVertexSelected && isDestinationVertexSelected) {
                selectedGraphElements.edges[
                    edge.getUri()
                    ] = "";
            }
        });
        VertexService.group(
            selectedGraphElements,
            GraphDisplayer.displayUsingNewCentralVertexUri
        );
    };
    api.refreshSelectionMenu = function(){
        setNbSelectedGraphElements(
            api.getNbSelected()
        );
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
    }
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
        $("body").removeClass("select");
        $(this).off(
            event
        );
        var resizeBox = $("<div class='selection-box'>");
        GraphUi.addHtml(resizeBox);
        resizeBox.css(
            "position", "absolute"
        ).css(
            "left", event.pageX - resizeBox.width() / 2
        ).css(
            "top", event.pageY - resizeBox.height() / 2
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
        getSelectBox().remove();
    }

    function getSelectBox() {
        return $(".selection-box");
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