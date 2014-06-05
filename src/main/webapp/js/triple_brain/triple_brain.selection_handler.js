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
        _selectBox,
        _selectionManagementButton,
        SELECT_BOX_MIN_WIDTH = 45,
        SELECT_BOX_MIN_HEIGHT = 40,
        selectionInfo = new SelectionInfo();

    api.setSelectionToSingleBubble = function (bubble) {
        deselectAll();
        selectionInfo.setToSingleBubble(bubble);
        bubble.select();
        bubble.makeSingleSelected();
        reflectSelectionChange();
    };

    api.setSelectionToSingleRelation = function (relation) {
        deselectAll();
        selectionInfo.setToSingleRelation(relation);
        relation.select();
        relation.makeSingleSelected();
        reflectSelectionChange();
    };

    api.addRelation = function (relation) {
        relation.select();
        selectionInfo.addRelation(relation);
        reflectSelectionChange();
    };

    api.addBubble = function (bubble) {
        bubble.select();
        selectionInfo.addBubble(bubble);
        reflectSelectionChange();
    };
    api.removeBubble = function (bubble) {
        bubble.deselect();
        selectionInfo.removeBubble(bubble);
        reflectSelectionChange();
    };
    api.removeRelation = function (relation) {
        relation.deselect();
        selectionInfo.removeRelation(relation);
        reflectSelectionChange();
    };

    api.setToNoneSelected = function () {
        deselectAll(
            selectionInfo.getSelectedBubbles()
        );
        deselectAll(
            selectionInfo.getSelectedRelations()
        );
        selectionInfo.setToNoneSelected();
        reflectSelectionChange();
    };

    api.getSelectedBubbles = function () {
        return selectionInfo.getSelectedBubbles();
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
    };
    api.getSelectionManagementButton = function () {
        if (!_selectionManagementButton) {
            _selectionManagementButton = $("#graph-elements-selected");
        }
        return _selectionManagementButton;
    };

    api.isOnlyASingleBubbleSelected = function () {
        return 1 === api.getNbSelectedBubbles() &&
            0 === api.getNbSelectedRelations();
    };
    api.getNbSelected = function () {
        return selectionInfo.getNbSelected();
    };
    api.getNbSelectedBubbles = function () {
        return selectionInfo.getNbSelectedBubbles();
    };
    api.getNbSelectedRelations = function () {
        return selectionInfo.getNbSelectedRelations();
    };
    api.getSelectedElements = function () {
        return selectionInfo.getSelectedElements();
    };
    api.getSingleElement = function () {
        return selectionInfo.getSingleElement();
    };
    EventBus.subscribe("/event/ui/graph/reset", selectionInfo.setToNoneSelected);
    return api;
    function reflectSelectionChange() {
        var nbSelectedGraphElements = selectionInfo.getNbSelected();
        if (0 === nbSelectedGraphElements) {
            api.getSelectionManagementButton().addClass("hidden");
            EventBus.publish(
                "/event/ui/selection/changed",
                selectionInfo
            );
            return;
        }
        api.getSelectionManagementButton().removeClass("hidden");
        getWhereToPutNbSelectedGraphElements().text(
            nbSelectedGraphElements
        );
        EventBus.publish(
            "/event/ui/selection/changed",
            selectionInfo
        );
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
                handles: "ne, se, sw, nw",
                containment: "document",
                start: ScrollOnMouseFrontier.doIt,
                stop: function () {
                    ScrollOnMouseFrontier.disable();
                    api.setToNoneSelected();
                    GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                        if (UiUtils.doComponentsCollide(
                            vertex.getHtml(),
                            getSelectBox()
                        )) {
                            api.addBubble(vertex);
                        }
                    });
                    removeSelectBoxIfExists();
                    reflectSelectionChange();
                }
            }
        );
    }

    function deselectAll() {
        deselectGraphElements(
            selectionInfo.getSelectedBubbles()
        );
        deselectGraphElements(
            selectionInfo.getSelectedRelations()
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

    function getWhereToPutNbSelectedGraphElements() {
        return api.getSelectionManagementButton().find(".nb");
    }

    function SelectionInfo() {
        var bubbles = [],
            relations = [],
            self = this;
        this.setToSingleBubble = function (bubble) {
            relations = [];
            bubbles[0] = bubble;
        };
        this.setToSingleRelation = function (relation) {
            bubbles = [];
            relations[0] = relation;
        };
        this.setToNoneSelected = function () {
            bubbles = [];
            relations = [];
        };
        this.addRelation = function (relation) {
            relations.push(relation);
        };
        this.addBubble = function (bubble) {
            bubbles.push(bubble);
        };
        this.removeBubble = function (bubble) {
            removeGraphElement(bubble, bubbles);
        };
        this.removeRelation = function (relation) {
            removeGraphElement(relation, relations);
        };
        this.getNbSelected = function () {
            return bubbles.length + relations.length;
        };
        this.getNbSelectedBubbles = function () {
            return bubbles.length;
        };
        this.getNbSelectedRelations = function () {
            return relations.length;
        };
        this.getSelectedBubbles = function () {
            return bubbles;
        };
        this.getSelectedRelations = function () {
            return relations;
        };
        this.getSelectedElements = function () {
            return bubbles.concat(
                relations
            );
        };
        this.getSingleElement = function () {
            return 1 === self.getNbSelectedBubbles() ?
                self.getSelectedBubbles()[0] : self.getSelectedRelations()[0];
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