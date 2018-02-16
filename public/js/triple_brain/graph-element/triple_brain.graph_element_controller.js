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
    "triple_brain.selection_handler",
    "triple_brain.user_map_autocomplete_provider",
    "bootstrap-wysiwyg",
    "bootstrap",
    "jquery.safer-html",
    "jquery.max_char"
], function ($, GraphElementType, GraphElementService, FriendlyResourceService, GraphDisplayer, MindMapInfo, EventBus, GraphUi, IdentificationMenu, EdgeService, Identification, Command, SelectionHandler, UserMapAutocompleteProvider) {
    "use strict";
    var api = {},
        bubbleCutClipboard,
        identificationBaseEventBusKey = "/event/ui/graph/identification/";
    var isMergePopoverBuilt = false;
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
    GraphElementController.prototype.getUiArray = function () {
        if (this.isSingle()) {
            return [this.graphElements];
        }
        return this.graphElements;
    };
    GraphElementController.prototype.getModel = function () {
        return this.getUi().getModel();
    };
    GraphElementController.prototype.getModelArray = function () {
        return this.getUiArray().map(function (ui) {
            return ui.getModel();
        });
    };
    GraphElementController.prototype.noteCanDo = function () {
        return this.isSingle() && (
            this.isOwned() || this.getModel().hasComment()
        );
    };
    GraphElementController.prototype.noteCanShowInLabel = function () {
        return $.Deferred().resolve(
            this.getModel().hasComment()
        );
    };
    GraphElementController.prototype.setLabel = function (newLabel) {
        this.getUi().getModel().setLabel(
            newLabel
        );
        this.getUi().setText(
            newLabel
        );
        return FriendlyResourceService.updateLabel(
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
        return false;
    };

    GraphElementController.prototype.visitOtherInstancesCanShowInLabel = function () {
        return $.Deferred().resolve(
            this.getUi().hasOtherVisibleInstance()
        );
    };

    GraphElementController.prototype.visitOtherInstancesInLabelClick = function () {
        this.getUi().showLinesToSimilarInstances();
        // var otherInstance = this.graphElements.getOtherInstances()[0];
        // $(
        //     otherInstance.getHtml()
        // ).centerOnScreenWithAnimation();
        // SelectionHandler.setToSingleGraphElement(
        //     otherInstance
        // );
    };

    GraphElementController.prototype.identifyCanDo = function () {
        return this.isSingle() && (
            (this.isOwned() && !this.getModel().hasIdentifications()) ||
            this.getModel().getIdentifiers().length === 1
        );
    };

    GraphElementController.prototype.identifyCanShowInLabel = function () {
        var canShow = this.getModel().getRelevantTags().length === 1;
        if (canShow) {
            var tag = this.getModel().getRelevantTags()[0];
            canShow = this.getUi().getTagNumberOfOtherReferences(
                tag
            ) > 0;
        }
        return $.Deferred().resolve(
            canShow
        );
    };

    GraphElementController.prototype.identifyWhenManyCanShowInLabel = function () {
        if (this.getModel().getRelevantTags().length < 2) {
            return $.Deferred().resolve(
                false
            );
        }
        return $.Deferred().resolve(
            this.getModel().getRelevantTags().some(function (tag) {
                return this.getUi().getTagNumberOfOtherReferences(tag) > 0;
            }.bind(this))
        );
    };

    GraphElementController.prototype.identifyWhenManyCanDo = function () {
        return this.isSingle() && this.getModel().getIdentifiers().length > 1;
    };

    GraphElementController.prototype.identifyWhenMany = GraphElementController.prototype.identify = function () {
        IdentificationMenu.ofGraphElement(
            this.graphElements
        ).create();
    };

    GraphElementController.prototype.acceptCanDo = function () {
        return false;
    };

    GraphElementController.prototype.acceptCanShowInLabel = function () {
        return $.Deferred().resolve(
            this.getUi().isDisplayingComparison()
        );
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

    GraphElementController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
        var deferred = this.expandDescendantsIfApplicable();
        return deferred.done(function () {
            this.getUi().expand(avoidCenter);
            var expandChildCalls = [];
            this.getUi().visitClosestChildVertices(function (childVertex) {
                if (childVertex.getModel().hasOnlyOneHiddenChild()) {
                    expandChildCalls.push(
                        childVertex.getController().expand(true, true, true)
                    );
                }
            });
            return $.when.apply($, expandChildCalls);
        }.bind(this));
    };

    GraphElementController.prototype.expandDescendantsIfApplicable = function () {
        var deferred = $.Deferred().resolve();
        if (this.getUi().isCollapsed()) {
            return deferred;
        }
        if (!this.getUi().hasDescendantsWithHiddenRelations()) {
            return deferred;
        }
        var addChildTreeActions = [];
        var avoidCenter = true;
        this.getUi().visitExpandableDescendants(function (expandableLeaf) {
            addChildTreeActions.push(
                expandableLeaf.getController().expand(avoidCenter)
            );
        });
        deferred = $.when.apply($, addChildTreeActions);
        return deferred;
    };

    GraphElementController.prototype.collapseCanDo = function () {
        return this.isSingle() && (
            (!this.getUi().isCenterBubble() && !this.getUi().isALeaf() && !this.getUi().isCollapsed()) ||
            (this.getUi().isCenterBubble() && this.getUi().hasAnExpandedChild())
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

    GraphElementController.prototype.moveUp = function () {
        var bubbleAbove = this.getUi().getBubbleAbove();
        if (bubbleAbove.isSameBubble(this.getUi())) {
            return;
        }
        if (bubbleAbove.isVertex()) {
            bubbleAbove = bubbleAbove.getParentBubble();
        }
        if (!bubbleAbove.getParentVertex().isSameBubble(this.getUi().getParentVertex())) {
            return this.moveBelow(
                bubbleAbove
            );
        }
        return this.moveAbove(
            bubbleAbove
        );
    };


    GraphElementController.prototype.moveDown = function () {
        var bubbleUnder = this.getUi().getBubbleUnder();
        if (bubbleUnder.isSameBubble(this.getUi())) {
            return;
        }
        if (bubbleUnder.isVertex()) {
            bubbleUnder = bubbleUnder.getParentBubble();
        }
        if (!bubbleUnder.getParentVertex().isSameBubble(this.getUi().getParentVertex())) {
            return this.moveAbove(
                bubbleUnder
            );
        }
        return this.moveBelow(
            bubbleUnder
        );
    };

    GraphElementController.prototype._canMoveAboveOrUnder = function (otherEdge) {
        var graphElementToCompare = this.getUi().isVertex() ?
            this.getUi().getParentBubble() :
            this.getUi();
        return !graphElementToCompare.isSameUri(otherEdge);
    };

    GraphElementController.prototype.moveBelow = function (otherEdge) {
        if (!this._canMoveAboveOrUnder(otherEdge)) {
            return $.Deferred().resolve();
        }
        var previousParentVertex = this.getUi().getParentVertex();
        return this._moveTo(
            otherEdge,
            false,
            previousParentVertex
        );
    };

    GraphElementController.prototype.moveAbove = function (otherEdge) {
        if (!this._canMoveAboveOrUnder(otherEdge)) {
            return $.Deferred().resolve();
        }
        var previousParentVertex = this.getUi().getParentVertex();
        return this._moveTo(
            otherEdge,
            true,
            previousParentVertex
        );
    };

    GraphElementController.prototype._canMoveUnderParent = function (parent) {
        var newParentIsNotSelf = this.getUi().getUri() !== parent.getUri();
        var isNotAlreadyParent = !this.getUi().getParentVertex().isSameBubble(parent);
        return newParentIsNotSelf && !this.getUi().isBubbleAChild(parent) && isNotAlreadyParent;
    };

    GraphElementController.prototype.moveUnderParent = function (parent) {
        if (!this._canMoveUnderParent(parent)) {
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
        var wasToTheLeft = this.getUi().isToTheLeft();
        var movedEdge = this.getUi().isVertex() ?
            this.getUi().getParentBubble() :
            this.getUi();
        var promises = [];
        if (!otherEdge.getParentBubble().isSameUri(movedEdge.getParentBubble())) {
            promises.push(
                movedEdge.getParentBubble().getController().becomeExParent(movedEdge)
            );
        }
        if (isAbove) {
            this.getUi().moveAbove(otherEdge);
        } else {
            this.getUi().moveBelow(otherEdge);
        }
        promises.push(
            GraphElementService.changeChildrenIndex(
                otherEdge.getParentVertex()
            )
        );
        promises.push(
            GraphElementService.changeChildrenIndex(
                previousParentVertex
            )
        );
        var parentBubble = otherEdge.getParentBubble();
        if (parentBubble.isGroupRelation()) {
            var identification = parentBubble.getGroupRelation().getIdentification();
            if (movedEdge.isGroupRelation()) {
                movedEdge.visitClosestChildRelations(function (relation) {
                    promises.push(
                        relation.getController().addIdentification(
                            identification
                        )
                    );
                });
            } else {
                promises.push(
                    movedEdge.getController().addIdentification(
                        identification
                    )
                );
            }
        }

        if (previousParentVertex.getUri() !== otherEdge.getParentVertex().getUri()) {
            if (movedEdge.isGroupRelation()) {
                movedEdge.expand();
                movedEdge.visitClosestChildRelations(function (relationUi) {
                    promises.push(
                        relationUi.getController().changeEndVertex(
                            otherEdge.getParentVertex()
                        )
                    );
                });
            } else {
                promises.push(
                    movedEdge.getController().changeEndVertex(
                        otherEdge.getParentVertex()
                    )
                );
            }
        }
        if (movedEdge.getParentBubble().isCenterBubble() && wasToTheLeft !== movedEdge.isToTheLeft()) {
            if (movedEdge.isGroupRelation()) {
                movedEdge.visitClosestChildRelations(function (childEdge) {
                    promises.push(
                        childEdge.getController().setIsToTheLeftOrRight()
                    );
                });
            } else {
                promises.push(
                    movedEdge.getController().setIsToTheLeftOrRight()
                );
            }
        }
        return $.when.apply($, promises);
    };

    GraphElementController.prototype.mergeCanDo = function () {
        return false;
    };

    GraphElementController.prototype.merge = function () {
        if (!isMergePopoverBuilt) {
            this.getUi().getHtml().popoverLikeToolTip({
                animation: false,
                html: true,
                title: $('<div>').append($.t("merge.title"), $('<br>'), $("<small>").text($.t("merge.instruction"))),
                placement: 'auto left',
                container: '#drawn_graph',
                trigger: "manual",
                allowMultiplePopoverDisplayed: true,
                content: function () {
                    return $("#merge-popover").html();
                }
            });
        }
        this.getUi().getHtml().popover("show").popover("show");
        $('.popover-title').mousedown(function (event) {
            event.stopPropagation();
        });
        var searchInput = $('.popover').find("input").empty().mousedown(function (event) {
            event.stopPropagation();
            $(this).focus();
        });
        if (!searchInput.isMrAutocompleteSetup()) {
            var searchFetcher = this.getUi().isMeta() ?
                UserMapAutocompleteProvider.toFetchOwnTags :
                UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesExcept;
            searchInput.mrAutocomplete({
                select: function (event, ui) {
                    event.preventDefault();
                    this.convertToDistantBubbleWithUri(ui.item.uri);
                    this.setLabel(ui.item.label);
                    this.getUi().getHtml().popover("hide");
                }.bind(this),
                resultsProviders: [
                    searchFetcher(
                        this.getUi(),
                        {
                            noFilter: true,
                            additionalFilter: function (searchResults) {
                                return searchResults.filter(function (searchResult) {
                                    return this.convertToDistantBubbleWithUriCanDo(
                                        searchResult.uri
                                    );
                                }.bind(this));
                            }.bind(this)
                        }
                    )
                ]
            });
        }
        searchInput.focus();
    };

    GraphElementController.prototype.becomeExParent = function () {
        return $.Deferred().resolve();
    };

    GraphElementController.prototype.addIdentifiers = function (identifiers) {
        var promises = [];
        identifiers.forEach(function (identifier) {
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

    GraphElementController.prototype.deselect = function () {
        if (this.isMultiple() || this.getUi().isCenterBubble()) {
            SelectionHandler.removeAll();
        }
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