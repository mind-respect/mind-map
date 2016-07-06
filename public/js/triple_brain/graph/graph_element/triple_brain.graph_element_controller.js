/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.graph_displayer",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus",
    "triple_brain.graph_ui",
    "triple_brain.identification_menu",
    "bootstrap-wysiwyg",
    "bootstrap",
    "jquery.safer-html"
], function ($, GraphElementService, FriendlyResourceService, GraphDisplayer, MindMapInfo, EventBus, GraphUi, IdentificationMenu) {
    "use strict";
    var api = {};
    EventBus.subscribe(
        '/event/ui/mind_map_info/is_view_only',
        setUpSaveButton
    );
    api._getBubbleNoteModal = function () {
        return $("#bubble-note-modal");
    };
    api._getContentEditor = function () {
        return api._getBubbleNoteModal().find(".editor");
    };
    api.Self = GraphElementController;
    function GraphElementController(graphElements) {
        if (graphElements) {
            this.init(graphElements);
        }
    }

    GraphElementController.prototype.init = function (graphElements) {
        this.graphElements = graphElements;
    };
    GraphElementController.prototype.getElements = function () {
        return this.graphElements;
    };

    GraphElementController.prototype.noteCanDo = function () {
        return this.isSingle() && (
                this.isOwned() || this.graphElements.hasNote()
            );
    };

    GraphElementController.prototype.note = function () {
        var editor = api._getContentEditor().saferHtml(
            this.graphElements.getNote()
        );
        api._getBubbleNoteModal().data(
            "graphElement", this.graphElements
        ).find(".bubble-label-in-title").text(
            this.graphElements.text()
        );
        getSaveButton().text($.t("vertex.menu.note.update"));
        api._getBubbleNoteModal().modal({
            backdrop: 'static',
            keyboard: false
        }).on('shown.bs.modal', function () {
            GraphUi.disableDragScroll();
        }).on('hidden.bs.modal', function () {
            GraphUi.enableDragScroll();
        });
        if (MindMapInfo.isViewOnly()) {
            api._getContentEditor().prop("content-editable", "false");
        }
        editor.wysiwyg({
            hotKeys: {
                'ctrl+b meta+b': 'bold',
                'ctrl+i meta+i': 'italic',
                'ctrl+u meta+u': 'underline',
                'ctrl+z meta+z': 'undo',
                'ctrl+y meta+y meta+shift+z': 'redo'
            }
        });
        editor.cleanHtml();
    };

    GraphElementController.prototype.visitOtherInstancesCanDo = function () {
        return this.isSingle() && this.graphElements.hasOtherInstances();
    };

    GraphElementController.prototype.visitOtherInstances = function () {
        $(
            this.graphElements.getOtherInstances()[0].getHtml()
        ).centerOnScreenWithAnimation();
    };

    GraphElementController.prototype.identifyCanDo = function () {
        return this.isSingle() && (
                this.isOwned() || this.graphElements.hasIdentifications()
            );
    };

    GraphElementController.prototype.identify = function () {
        IdentificationMenu.ofGraphElement(
            this.graphElements
        ).create();
    };

    GraphElementController.prototype.identifyBtnClick = function (event) {
        event.stopPropagation();
        this.identify();
    };

    GraphElementController.prototype.acceptCanDo = function () {
        return false;
    };

    GraphElementController.prototype.accept = function () {
        var self = this;
        var comparedWithLabel = this.getElements().getComparedWith().getLabel();
        FriendlyResourceService.updateLabel(
            this.getElements(),
            comparedWithLabel,
            function () {
                self.getElements().getModel().setLabel(comparedWithLabel);
                self.getElements().labelUpdateHandle();
            }
        );
    };

    GraphElementController.prototype.isSingleAndOwned = function () {
        return this.isSingle() && this.isOwned();
    };

    GraphElementController.prototype.isGroupAndOwned = function () {
        return !this.isSingle() && this.isOwned();
    };

    GraphElementController.prototype.isSingle = function () {
        return !(this.graphElements instanceof Array);
    };
    GraphElementController.prototype.isOwned = function () {
        return !MindMapInfo.isViewOnly();
    };

    setUpCancelButton();
    initNoteModal();
    function setUpSaveButton() {
        if (MindMapInfo.isViewOnly()) {
            getSaveButton().addClass("hidden");
            return;
        }
        getSaveButton().click(function (event) {
            event.preventDefault();
            $(this).text(
                $.t("vertex.menu.note.saving") + " ..."
            );
            var graphElement = api._getBubbleNoteModal().data("graphElement");
            GraphElementService.updateNote(
                graphElement,
                api._getContentEditor().html(),
                function (graphElement) {
                    graphElement.reviewInLabelButtonsVisibility();
                    hideNoteModal();
                }
            );
        });
    }

    function setUpCancelButton() {
        getCancelButton().click(function (event) {
            event.preventDefault();
            hideNoteModal();
        });
    }

    function getSaveButton() {
        return api._getBubbleNoteModal().find("button.save");
    }

    function getCancelButton() {
        return api._getBubbleNoteModal().find("button.cancel");
    }

    function hideNoteModal() {
        api._getBubbleNoteModal().modal("hide");
    }

    function initNoteModal() {
        api._getBubbleNoteModal().on('show.bs.modal', function () {
            GraphUi.disableDragScroll();
        }).on('hide.bs.modal', function () {
            GraphUi.enableDragScroll();
        });
        api._getBubbleNoteModal().find("input[data-edit=createLink]").click(function (event) {
            event.stopPropagation();
        });
    }

    return api;
});