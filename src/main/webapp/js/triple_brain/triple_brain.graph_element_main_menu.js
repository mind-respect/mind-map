/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.graph_element_button",
    "jquery-ui"
], function ($, GraphDisplayer, EventBus, SelectionHandler, GraphElementButton) {
    var api = {};
    api.reset = function () {
        initButtons();
        getMenu().draggable({
            stop:function () {
                var menu = $(this);
                var topOff = menu.offset().top - $(window).scrollTop()
                menu.css("top", topOff)
                menu.css("position", "fixed")
            }
        });
        function initButtons() {
            api.visitButtons(function (button) {
                var html = button.getHtml();
                html.button({
                    icons:{
                        primary:"ui-icon " + button.getIconClass()
                    },
                    text:false
                });
                html.on(
                    "click",
                    function (event) {
                        event.stopPropagation();
                        var button = $(this);
                        var method = button.attr("data-action");
                        getCurrentClickHandler()[
                            method
                            ](
                            event,
                            SelectionHandler.getSelectedElements()
                        );
                    }
                );
            });
        }
    };
    api.visitButtons = function(visitor){
        $.each(getButtonsHtml(), function () {
            visitor(
                GraphElementButton.fromHtml(
                    $(this)
                )
            );
        });
    };
    EventBus.subscribe("/event/ui/selection/changed", function (event, selectedElements) {
        var clickHandler = updateCurrentClickHandler();
        api.visitButtons(function (button) {
            button.showOnlyIfApplicable(
                clickHandler,
                selectedElements
            );
        });
    });
    return api;

    function getButtonsHtml() {
        return getMenu().find("> button");
    }

    function getMenu() {
        return $("#graph-element-menu");
    }

    function updateCurrentClickHandler() {
        var nbSelectedGraphElements = SelectionHandler.getNbSelected();
        var currentClickHandler;
        var vertexMenuHandler = GraphDisplayer.getVertexMenuHandler();
        var relationMenuHandler = GraphDisplayer.getRelationMenuHandler();
        if (0 === nbSelectedGraphElements) {
            currentClickHandler = GraphDisplayer.getGraphMenuHandler();
        }
        else if (1 === nbSelectedGraphElements) {
            currentClickHandler = SelectionHandler.getSelectedElements().isConcept() ?
                vertexMenuHandler.forSingle() :
                relationMenuHandler.forSingle();
        } else {
            var nbSelectedBubbles = SelectionHandler.getNbSelectedBubbles();
            var nbSelectedRelations = SelectionHandler.getNbSelectedRelations();
            if(0 === nbSelectedBubbles){
                currentClickHandler = relationMenuHandler.forGroup();
            }else if(0 === nbSelectedRelations){
                currentClickHandler = vertexMenuHandler.forGroup();
            }else{
                currentClickHandler = GraphDisplayer.getGraphElementMenuHandler();
            }
        }
        setCurrentClickHandler(
            currentClickHandler
        );
        return currentClickHandler;
    }
    function setCurrentClickHandler(currentClickHandler) {
        getMenu().data(
            "currentClickHandler",
            currentClickHandler
        );
    }

    function getCurrentClickHandler() {
        return getMenu().data(
            "currentClickHandler"
        );
    }
});