/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_type",
    "triple_brain.graph_element_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.graph_displayer",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus",
    "triple_brain.graph_ui",
    "triple_brain.identification_menu",
    "triple_brain.edge_service",
    "triple_brain.identification",
    "mr.command",
    "bootstrap-wysiwyg",
    "bootstrap",
    "jquery.safer-html",
    "jquery.max_char"
], function ($, GraphElementType, GraphElementService, FriendlyResourceService, GraphDisplayer, MindMapInfo, EventBus, GraphUi, IdentificationMenu, EdgeService, Identification, Command) {
    "use strict";
    var api = {},
        bubbleCutClipboard,
        identificationBaseEventBusKey = "/event/ui/graph/identification/";
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
    api.GraphElementController = GraphElementController;
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
                this.isOwned() || this.getModel().hasComment()
            );
    };

    GraphElementController.prototype.setLabel = function (newLabel) {
        this.getUi().getModel().setLabel(
            newLabel
        );
        this.getUi().setText(
            newLabel
        );
        FriendlyResourceService.updateLabel(
            this.getUi(),
            newLabel
        );
    };

    GraphElementController.prototype.note = function () {
        var editor = api._getContentEditor().saferHtml(
            this.getUi().getModel().getComment()
        );
        api._getBubbleNoteModal().data(
            "graphElement", this.graphElements
        ).find(".bubble-label-in-title").text(
            this.getUi().text()
        );
        getSaveButton().text($.t("vertex.menu.note.update"));
        var $modal = api._getBubbleNoteModal();
        $modal.modal({
            backdrop: 'static',
            keyboard: false
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

    GraphElementController.prototype.focus = function () {
        this.getUi().focus();
    };

    GraphElementController.prototype.travelLeft = function () {
        this.getUi().travelLeft();
    };

    GraphElementController.prototype.travelRight = function () {
        this.getUi().travelRight();
    };

    GraphElementController.prototype.travelUp = function () {
        this.getUi().travelUp();
    };

    GraphElementController.prototype.travelDown = function () {
        this.getUi().travelDown();
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
                this.isOwned() || this.getUi().getModel().hasIdentifications()
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
        this.expandDescendantsIfApplicable();
        return deferred.done(function () {
            this.getUi().expand(avoidCenter);
        }.bind(this));
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
                undefined === bubbleCutClipboard || !this.getUi().isSameBubble(
                    bubbleCutClipboard
                )
            );
    };

    GraphElementController.prototype.cut = function () {
        bubbleCutClipboard = this.getUi();
        this.getUi().cut();
    };

    GraphElementController.prototype.pasteCanDo = function () {
        return this.isSingleAndOwned() && this.getUi().isLabelEditable();
    };

    GraphElementController.prototype.paste = function (event) {
        if (bubbleCutClipboard === undefined) {
            this._pasteText(event);
        } else {
            this._pasteBubble();
        }
        this.getUi().paste();
    };

    GraphElementController.prototype._pasteText = function (event) {
        var clipText = '';
        if (window.clipboardData) {
            clipText = window.clipboardData.getData('Text');
        } else if (typeof event === 'object' && event.clipboardData) {
            clipText = event.clipboardData.getData('text/plain');
        }
        var separator = "" === this.getUi().text().trim() ?
            "" : " ";
        this.setLabel(
            $.maxCharText(
                this.getModel().getLabel() + separator + clipText
            )
        );
        this.getUi().getLabel().blur();
        this.getUi().pasteText();
    };

    GraphElementController.prototype._pasteBubble = function () {
        if (!bubbleCutClipboard.getController()._canMoveUnderParent(this.getUi())) {
            return;
        }
        bubbleCutClipboard.getController().moveUnderParent(
            this.getUi()
        );
        bubbleCutClipboard = undefined;
        this.getUi().pasteBubble();
    };

    GraphElementController.prototype.moveUnder = function (otherEdge) {
        var previousParentVertex = this.getUi().getParentVertex();
        return this._moveTo(
            otherEdge,
            false,
            previousParentVertex
        );
    };

    GraphElementController.prototype.moveAbove = function (otherEdge) {
        var previousParentVertex = this.getUi().getParentVertex();
        return this._moveTo(
            otherEdge,
            true,
            previousParentVertex
        );
    };

    GraphElementController.prototype._canMoveUnderParent = function (parent) {
        return this.getUi().getUri() !== parent.getUri() && !this.getUi().isBubbleAChild(parent);
    };

    GraphElementController.prototype.moveUnderParent = function (parent) {
        if(!this._canMoveUnderParent(parent)){
            return $.Deferred().resolve();
        }
        var previousParent;
        var moveUnderParentCommand = new Command.forExecuteUndoAndRedo(
            function () {
                previousParent = this.getUi().getParentVertex();
                return parent.getController().becomeParent(this.getUi());
            }.bind(this),
            function () {
                return previousParent.getController().becomeParent(this.getUi());
            }.bind(this),
            function () {
                return parent.getController().becomeParent(this.getUi());
            }.bind(this)
        );
        return Command.executeCommand(
            moveUnderParentCommand
        );
    };

    GraphElementController.prototype._moveTo = function (otherEdge, isAbove, previousParentVertex) {
        var previousIndex = this.getUi().getIndexInTree();
        var moveToCommand = new Command.forExecuteUndoAndRedo(
            function () {
                return this._moveToExecute(otherEdge, isAbove, previousParentVertex);
            }.bind(this),
            function () {
                var edgeUnder = previousParentVertex.getChildOfTypeAtIndex(
                    GraphElementType.Relation,
                    previousIndex
                );
                return this._moveToExecute(
                    edgeUnder,
                    true,
                    this.getUi().getParentVertex()
                );
            }.bind(this)
        );
        return Command.executeCommand(
            moveToCommand
        );
    };

    GraphElementController.prototype._moveToExecute = function (otherEdge, isAbove, previousParentVertex) {
        if (isAbove) {
            this.getUi().moveAbove(otherEdge);
        } else {
            this.getUi().moveUnder(otherEdge);
        }
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
        var addIdentificationPromise = $.Deferred().resolve();
        if (parentBubble.isGroupRelation()) {
            var identification = parentBubble.getGroupRelation().getIdentification();
            addIdentificationPromise = movedEdge.getController().addIdentification(
                identification
            );
        }
        if (previousParentVertex.getUri() !== otherEdge.getParentVertex().getUri()) {
            return $.when.apply($, [
                addIdentificationPromise,
                movedEdge.getController().changeEndVertex(
                    otherEdge.getParentVertex()
                ).then(changeSortDate)
            ]);
        }
        return changeSortDate();
        function changeSortDate() {
            return GraphElementService.changeSortDate(
                movedVertex.getModel()
            );
        }
    };

    GraphElementController.prototype.becomeExParent = function(){
        return $.Deferred().resolve();
    };

    GraphElementController.prototype.addIdentifiers = function (identifiers) {
        var promises = [];
        identifiers.forEach(function(identifier){
            promises.push(this.addIdentification(identifier));
        }.bind(this));
        return $.when.apply($, promises);
    };

    GraphElementController.prototype.addIdentification = function (identification) {
        var self = this;
        var deferred = $.Deferred();
        GraphElementService.addIdentification(
            this.getUi(),
            identification
        ).then(function (identifications) {
            self.getUi().getModel().addIdentifications(
                identifications
            );
            $.each(identifications, function () {
                var identification = this;
                self.getUi().addIdentification(
                    identification
                );
                self.getUi().applyToOtherInstances(function (otherInstanceUi) {
                    otherInstanceUi.getModel().addIdentification(
                        identification
                    );
                    otherInstanceUi.addIdentification(
                        identification
                    );
                });
                EventBus.publish(
                    identificationBaseEventBusKey + "added",
                    [self.getUi(), identification]
                );
            });
            deferred.resolve(identifications);
        });
        return deferred.promise();
    };

    GraphElementController.prototype.removeIdentifier = function (identification) {
        var deferred = $.Deferred();
        var self = this;
        GraphElementService.removeIdentifier(
            this.getUi(),
            identification
        ).then(function () {
            self.getUi().getModel().removeIdentifier(
                identification
            );
            self.getUi().removeIdentifier(
                identification
            );
            deferred.resolve();
            self.getUi().applyToOtherInstances(function (otherUi) {
                otherUi.getModel().removeIdentifier(
                    identification
                );
                otherUi.removeIdentifier(identification);
            });
            var eventBusKey = identificationBaseEventBusKey + "removed";
            EventBus.publish(
                eventBusKey,
                [self.getUi(), identification]
            );
        });
        return deferred.promise();

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
        api._getBubbleNoteModal().on('shown.bs.modal', function () {
            GraphUi.disableDragScroll();
            api._getContentEditor().focusEnd();
        }).on('hidden.bs.modal', function () {
            GraphUi.enableDragScroll();
        });
        api._getBubbleNoteModal().find("input[data-edit=createLink]").click(function (event) {
            event.stopPropagation();
        });
    }

    return api;
});