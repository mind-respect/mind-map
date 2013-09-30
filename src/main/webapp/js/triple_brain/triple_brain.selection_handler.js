/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.scroll_on_mouse_frontier",
    "triple_brain.ui.vertex",
    "triple_brain.ui.utils",
    "triple_brain.vertex",
    "triple_brain.graph_displayer",
    "jquery-ui"
], function($, GraphUi, ScrollOnMouseFrontier, VertexUi, UiUtils, VertexService, GraphDisplayer){
    var api = {};
    api.reset = function(){
        setNbSelectedBubbles(0);
        VertexUi.resetSelection();
    };
    api.handleSelectionManagementClick = function(event){
        event.preventDefault();
    };
    api.handleButtonClick = function(){
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
    api.getSelectionManagementButton = function(){
        return $("#bubbles-selected");
    };
    api.getGroupButton = function(){
        return $("#group-selected");
    };
    api.handleGroupButtonClick = function(){
        var selectedVertices = [];
        VertexUi.visitSelected(function(vertex){
            selectedVertices.push(vertex);
        });
        VertexService.group(
            selectedVertices,
            GraphDisplayer.displayUsingNewCentralVertexUri
        );
    };
    return api;
    function getMindMap() {
        return $("svg");
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
                stop: function(){
                    ScrollOnMouseFrontier.disable();
                    VertexUi.resetSelection();
                    var nbSelected = 0;
                    VertexUi.visitAllVertices(function(vertex){
                        if(UiUtils.doComponentsCollide(
                            vertex.getHtml(),
                            getSelectBox()
                        )){
                            vertex.select();
                            nbSelected++;
                        }
                    });
                    removeSelectBoxIfExists();
                    setNbSelectedBubbles(nbSelected);
                }
            }
        );
    }
    function removeSelectBoxIfExists(){
        getSelectBox().remove();
    }
    function getSelectBox(){
        return $(".selection-box");
    }

    function setNbSelectedBubbles(nbSelectedBubbles){
        if(nbSelectedBubbles === 0){
            api.getSelectionManagementButton().hide();
            api.getGroupButton().hide();
            return;
        }
        api.getSelectionManagementButton().show();
        getWhereToPutNbSelectedBubbles().text(nbSelectedBubbles);
        if(nbSelectedBubbles === 1){
            api.getGroupButton().hide();
        }else{
            api.getGroupButton().show();
        }
    }

    function getWhereToPutNbSelectedBubbles(){
        return api.getSelectionManagementButton().find(".nb");
    }
});