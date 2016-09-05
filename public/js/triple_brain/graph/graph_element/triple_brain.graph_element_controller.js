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
    "triple_brain.edge_service",
    "triple_brain.identification",
    "bootstrap-wysiwyg",
    "bootstrap",
    "jquery.safer-html"
], function ($, GraphElementService, FriendlyResourceService, GraphDisplayer, MindMapInfo, EventBus, GraphUi, IdentificationMenu, EdgeService, Identification) {
    "use strict";
    var api = {},
        cut;
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
    GraphElementController.prototype.getUi = function () {
        return this.graphElements;
    };
    GraphElementController.prototype.getModel = function () {
        return this.getUi().getModel();
    };
    GraphElementController.prototype.noteCanDo = function () {
        return this.isSingle() && (
                this.isOwned() || this.graphElements.hasNote()
            );
    };

    GraphElementController.prototype.note = function () {
        var editor = api._getContentEditor().saferHtml(
            this.getUi().getNote()
        );
        api._getBubbleNoteModal().data(
            "graphElement", this.graphElements
        ).find(".bubble-label-in-title").text(
            this.getUi().text()
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
    };

    GraphElementController.prototype.centerCanDo = function () {
        return this.isSingle() && !this.getUi().isCenterBubble();
    };

    GraphElementController.prototype.center = function () {
        GraphDisplayer.displayUsingCentralBubble(
            this.getUi()
        );
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
                this.isOwned() || this.getUi().hasIdentifications()
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
        var comparedWithLabel = this.getUi().getComparedWith().getLabel();
        FriendlyResourceService.updateLabel(
            this.getUi(),
            comparedWithLabel,
            function () {
                self.getUi().getModel().setLabel(comparedWithLabel);
                self.getUi().labelUpdateHandle();
            }
        );
    };

    GraphElementController.prototype.expandCanDo = function () {
        return this.isSingle() && (
                this.getUi().hasVisibleHiddenRelationsContainer() ||
                this.getUi().hasDescendantsWithHiddenRelations() ||
                this.getUi().isCollapsed()
            );
    };

    GraphElementController.prototype.expand = function (avoidCenter) {
        var deferred = $.Deferred().resolve();
        var self = this;
        this.expandDescendantsIfApplicable();
        return deferred.done(function () {
            self.getUi().expand(avoidCenter);
        });
    };

    GraphElementController.prototype.expandDescendantsIfApplicable = function () {
        var deferred = $.Deferred();
        if (this.getUi().hasDescendantsWithHiddenRelations()) {
            var addChildTreeActions = [];
            var avoidCenter = true;
            this.getUi().visitExpandableDescendants(function (expandableLeaf) {
                addChildTreeActions.push(
                    expandableLeaf.getController().expand(avoidCenter)
                );
            });
            deferred = $.when.apply($, addChildTreeActions);
        }
        return deferred;
    };

    GraphElementController.prototype.collapseCanDo = function () {
        return this.isSingle() && !this.getUi().isCenterBubble() && (
                !this.getUi().isALeaf() && !this.getUi().isCollapsed()
            );
    };

    GraphElementController.prototype.collapse = function () {
        this.getUi().collapse();
    };

    GraphElementController.prototype.cutCanDo = function () {
        return this.isSingleAndOwned() && !this.getUi().isCenterBubble() && (
                undefined === cut || !this.getUi().isSameBubble(
                    cut
                )
            );
    };

    GraphElementController.prototype.cut = function () {
        cut = this.getUi();
        this.getUi().cut();
    };

    GraphElementController.prototype.pasteCanDo = function () {
        return this.isSingleAndOwned() && cut !== undefined &&
            cut.getController()._canMoveAfter(
                this.getUi()
            );
    };

    GraphElementController.prototype.paste = function () {
        cut.getController().moveAfter(
            this.getUi()
        );
        cut = undefined;
        this.getUi().paste();
    };

    GraphElementController.prototype.moveUnder = function (otherEdge) {
        var previousParentVertex = this.getUi().getParentVertex();
        this.getUi().moveUnder(otherEdge);
        this._moveTo(
            otherEdge,
            false,
            previousParentVertex
        );
    };

    GraphElementController.prototype.moveAbove = function (otherEdge) {
        var previousParentVertex = this.getUi().getParentVertex();
        this.getUi().moveAbove(otherEdge);
        this._moveTo(
            otherEdge,
            true,
            previousParentVertex
        );
    };

    GraphElementController.prototype._canMoveAfter = function (parent) {
        return this.getUi().getUri() !== parent.getUri() && !this.getUi().isBubbleAChild(parent);
    };

    GraphElementController.prototype.moveAfter = function (parent) {
        var ui = this.getUi();
        if (!this._canMoveAfter(parent)) {
            return;
        }
        if (parent.isRelation()) {
            var newGroupRelation = GraphDisplayer.addNewGroupRelation(
                Identification.fromFriendlyResource(
                    parent.getModel()
                ),
                parent.getParentBubble(),
                parent.isToTheLeft()
            );
            parent.moveToParent(newGroupRelation);
            parent = newGroupRelation;
        }
        var newSourceVertex = parent.isVertex() ?
            parent :
            parent.getParentVertex();
        var movedEdge = ui.isRelation() ?
            ui :
            ui.getParentBubble();
        var previousParentGroupRelation = movedEdge.getParentBubble();
        ui.moveToParent(
            parent
        );
        if (parent.isGroupRelation()) {
            var identification = parent.getGroupRelation().getIdentification();
            EdgeService.addSameAs(
                movedEdge,
                identification
            );
        }
        movedEdge.getController().changeEndVertex(newSourceVertex);
        if (previousParentGroupRelation.isGroupRelation()) {
            GraphElementService.removeIdentification(
                movedEdge,
                movedEdge.getIdentificationWithExternalUri(
                    previousParentGroupRelation.getModel().getIdentification().getExternalResourceUri()
                )
            );
        }
    };

    GraphElementController.prototype._moveTo = function (otherEdge, isAbove, previousParentVertex) {
        var movedEdge = this.getUi().isVertex() ?
            this.getUi().getParentBubble() :
            this.getUi();
        var movedVertex = movedEdge.getTopMostChildBubble();
        var otherVertex = otherEdge.getTopMostChildBubble();
        movedVertex.getModel().setSortDate(
            new Date(
                otherVertex.getModel().getSortDate().getTime() + (isAbove ? -10 : 10)
            )
        );
        var parentBubble = otherEdge.getParentBubble();
        if (parentBubble.isGroupRelation()) {
            var identification = parentBubble.getGroupRelation().getIdentification();
            EdgeService.addSameAs(
                movedEdge,
                identification
            );
        }
        if (previousParentVertex.getUri() !== otherEdge.getParentVertex().getUri()) {
            return movedEdge.getController().changeEndVertex(
                otherEdge.getParentVertex()
            ).then(changeSortDate);
        }
        return changeSortDate();
        function changeSortDate() {
            return GraphElementService.changeSortDate(
                movedVertex.getModel()
            );
        }
    };

    GraphElementController.prototype.selectTreeCanDo = function () {
        return this.isSingleAndOwned() && this.getUi().hasChildren();
    };

    GraphElementController.prototype.selectTree = function () {
        this.getUi().selectTree();
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
    GraphElementController.prototype.isMultiple = function () {
        return !this.isSingle();
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
            var note = api._getContentEditor().html();
            graphElement.getModel().setComment(note);
            GraphElementService.updateNote(
                graphElement,
                note,
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