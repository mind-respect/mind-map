/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_element_button",
    "triple_brain.graph_element_type",
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.selection_handler",
    "triple_brain.graph_ui",
    "triple_brain.keyboard_actions_handler",
    "jquery.focus-end",
    "jquery.center-on-screen",
    "jquery.safer-html",
    "jquery.max_char"
], function ($, GraphDisplayer, GraphElementMainMenu, GraphElementButton, GraphElementType, EventBus, MindMapInfo, SelectionHandler, GraphUi, KeyboardActionsHandler) {
    "use strict";
    var api = {},
        otherInstancesKey = "otherInstances",
        textBeforeModificationKey = "textBeforeModification",
        _centralBubble,
        _isWikidataActive = false;
    api.Types = GraphElementType;
    var controllerGetters = {},
        selectors = {};
    initMenuHandlerGetters();
    initSelectors();

    api.isWikidataActiveForInBubbleEdition = function () {
        return _isWikidataActive;
    };

    api.activateWikidataForInBubbleEdition = function () {
        _isWikidataActive = true;
    };

    api.deactivateWikidataForInBubbleEdition = function () {
        _isWikidataActive = false;
    };

    api.setDraggedElement = function (vertex) {
        $("body").data(
            "dragged-vertex",
            vertex
        );
    };
    api.getDraggedElement = function () {
        return $("body").data(
            "dragged-vertex"
        );
    };
    api.hasCenterBubble = function () {
        return undefined !== _centralBubble;
    };
    api.getCenterBubble = function () {
        return _centralBubble;
    };
    api.isCenterVertex = function () {
        return _centralBubble;
    };
    api.getCenterVertexOrSchema = function () {
        var centerBubble = api.getCenterBubble();
        if (centerBubble.isCenterVertexSchemaOrMeta()) {
            return centerBubble;
        }
        return centerBubble.getParentBubble();
    };
    api.buildCommonConstructors = function (api) {
        var cacheWithIdAsKey = {},
            cacheWithUriAsKey = {};
        api.initCache = function (graphElement) {
            cacheWithIdAsKey[graphElement.getId()] = graphElement;
            updateUriCache(graphElement.getUri(), graphElement);
        };
        api.withHtml = function (html) {
            return api.withId(
                html.prop('id')
            );
        };
        api.withId = function (id) {
            return cacheWithIdAsKey[id];
        };
        api.withUri = function (uri) {
            return cacheWithUriAsKey[uri];
        };
        api.lastAddedWithUri = function (uri) {
            return cacheWithUriAsKey[uri][
            cacheWithUriAsKey[uri].length - 1
                ];
        };
        api.visitAll = function (visitor) {
            $.each(cacheWithIdAsKey, function () {
                visitor(this);
            });
        };
        api.getNumber = function () {
            return Object.keys(cacheWithIdAsKey).length;
        };
        api.removeFromCache = function (uri, id) {
            var cache = cacheWithUriAsKey[uri];
            if (undefined === cache) {
                return;
            }
            var len = cache.length;
            while (len--) {
                var vertex = cacheWithUriAsKey[uri][len];
                if (vertex.getId() === uri) {
                    cacheWithUriAsKey.splice(len, 1);
                }
            }
            delete cacheWithIdAsKey[id];
        };
        EventBus.subscribe('/event/ui/graph/reset', emptyCache);
        function emptyCache() {
            cacheWithIdAsKey = {};
            cacheWithUriAsKey = {};
        }

        function updateUriCache(uri, vertex) {
            if (undefined === cacheWithUriAsKey[uri]) {
                cacheWithUriAsKey[uri] = [];
            }
            cacheWithUriAsKey[uri].push(vertex);
        }
    };
    api.visitAll = function (visitor) {
        GraphDisplayer.getVertexSelector().visitAll(
            visitor
        );
        GraphDisplayer.getEdgeSelector().visitAll(
            visitor
        );
        GraphDisplayer.getGroupRelationSelector().visitAll(
            visitor
        );
        GraphDisplayer.getSchemaSelector().visitAll(
            visitor
        );
        GraphDisplayer.getPropertySelector().visitAll(
            visitor
        );
    };

    api.GraphElementUi = function () {
    };
    api.GraphElementUi.prototype.setModel = function (serverJson) {
        this.model = serverJson;
    };
    api.GraphElementUi.prototype.getModel = function () {
        return this.model;
    };
    api.GraphElementUi.prototype.getId = function () {
        return this.getHtml().attr("id");
    };
    api.GraphElementUi.prototype.hasTheDuplicateButton = function () {
        return !this.getOtherInstanceButton().hasClass(
            "hidden"
        );
    };

    api.GraphElementUi.prototype.hasOtherInstances = function () {
        return this.getOtherInstances().length > 0;
    };

    api.GraphElementUi.prototype.getOtherInstances = function () {
        if (this.html.data(otherInstancesKey) === undefined) {
            this._defineSameInstances();
        }
        return this.html.data(otherInstancesKey);
    };

    api.GraphElementUi.prototype._defineSameInstances = function () {
        var elementsWithSameUri = this.getSelector().withUri(
            this.getUri()
        );
        var otherInstances = [],
            self = this;
        $.each(elementsWithSameUri, function () {
            var elementWithSameUri = this;
            if (elementWithSameUri.getId() === self.getId()) {
                return;
            }
            otherInstances.push(
                elementWithSameUri
            );
        });
        this.html.data(
            otherInstancesKey,
            otherInstances
        );
    };

    api.GraphElementUi.prototype.setAsCentral = function () {
        if (api.hasCenterBubble()) {
            api.getCenterBubble().setAsNonCentral();
        }
        _centralBubble = this;
        this.html.addClass('center-vertex');
        this.hideCenterButton();
    };

    api.GraphElementUi.prototype.setAsNonCentral = function () {
        this.html.removeClass('center-vertex');
        this.showCenterButton();
    };

    api.GraphElementUi.prototype.showCenterButton = function () {
        this.centerButton().addClass("hidden");
    };
    api.GraphElementUi.prototype.hideCenterButton = function () {
        this.centerButton().removeClass("hidden");
    };

    api.GraphElementUi.prototype.centerButton = function () {
        return this.html.find('.center');
    };
    api.GraphElementUi.prototype.scrollTo = function () {
        this.html.centerOnScreen();
    };
    api.GraphElementUi.prototype.applyToOtherInstances = function (apply) {
        $.each(this.getOtherInstances(), function () {
            var element = this;
            apply(element);
        });
    };

    api.GraphElementUi.prototype.resetOtherInstances = function () {
        this._resetOtherInstancesNonDeep();
        this.applyToOtherInstances(function (otherInstance) {
            otherInstance._resetOtherInstancesNonDeep();
        });
    };

    api.GraphElementUi.prototype._resetOtherInstancesNonDeep = function () {
        this.html.removeData(otherInstancesKey);
    };

    api.GraphElementUi.prototype.isVertex = function () {
        return this.getGraphElementType() === api.Types.Vertex;
    };
    api.GraphElementUi.prototype.isCenterBubble = function () {
        return this.html.hasClass("center-vertex");
    };
    api.GraphElementUi.prototype.isCenterVertexSchemaOrMeta = function () {
        return (
                this.isVertex() || this.isSchema() || this.isMeta()
            ) && this.isCenterBubble();
    };

    api.GraphElementUi.prototype.isSchema = function () {
        return this.getGraphElementType() === api.Types.Schema;
    };
    api.GraphElementUi.prototype.isMeta = function () {
        return this.getGraphElementType() === api.Types.Meta;
    };
    api.GraphElementUi.prototype.isMetaRelation = function () {
        return this.getGraphElementType() === api.Types.MetaRelation;
    };
    api.GraphElementUi.prototype.isRelation = function () {
        return this.getGraphElementType() === api.Types.Relation;
    };
    api.GraphElementUi.prototype.isEdge = function () {
        return this.isInTypes(
            GraphElementType.getEdgeTypes()
        );
    };
    api.GraphElementUi.prototype.isGroupRelation = function () {
        return this.getGraphElementType() === api.Types.GroupRelation;
    };
    api.GraphElementUi.prototype.isProperty = function () {
        return this.getGraphElementType() === api.Types.Property;
    };
    api.GraphElementUi.prototype.isVertexSuggestion = function () {
        return this.getGraphElementType() === api.Types.VertexSuggestion;
    };
    api.GraphElementUi.prototype.isRelationSuggestion = function () {
        return this.getGraphElementType() === api.Types.RelationSuggestion;
    };
    api.GraphElementUi.prototype.isInTheRelationFamily = function () {
        return this.getHtml().hasClass("relation");
    };
    api.GraphElementUi.prototype.getSimilarButtonHtml = function (button) {
        return this.getButtonHtmlHavingAction(
            button.getAction()
        );
    };
    api.GraphElementUi.prototype.getAddChildButton = function () {
        return this.getButtonHtmlHavingAction(
            "addChild"
        );
    };
    api.GraphElementUi.prototype.getButtonHtmlHavingAction = function (action) {
        return this.getMenuHtml().find(
            "[data-action=" + action + "]"
        );
    };

    api.GraphElementUi.prototype.reviewMenuButtonsVisibility = function () {
        var self = this;
        this.visitMenuButtons(function (button) {
            button.showOnlyIfApplicable(
                self.getController(),
                self
            );
        });
    };

    api.GraphElementUi.prototype.visitMenuButtons = function (visitor) {
        this.getMenuHtml().find(
            "button"
        ).each(function () {
            visitor(
                GraphElementButton.fromHtml(
                    $(this)
                )
            );
        });
    };

    api.GraphElementUi.prototype.hasDragOver = function () {
        return this.getHtml().hasClass("drag-over");
    };

    api.GraphElementUi.prototype.enterDragOver = function () {
        this.getHtml().addClass("drag-over");
    };

    api.GraphElementUi.prototype.leaveDragOver = function () {
        this.getHtml().removeClass("drag-over");
    };

    api.GraphElementUi.prototype.getController = function () {
        return this.getControllerWithElements(this);
    };

    api.GraphElementUi.prototype.getControllerWithElements = function (elements) {
        var controller = this._getControllerClass();
        return new controller[
            this._getControllerName()
            ](elements);
    };

    api.GraphElementUi.prototype._getControllerName = function () {
        var controllerName = "";
        var nameParts = this.getGraphElementType().split("_");
        nameParts.forEach(function(namePart){
           controllerName += namePart.capitalizeFirstLetter();
        });
        return controllerName + "Controller";
    };

    api.GraphElementUi.prototype._getControllerClass = function () {
        return controllerGetters[
            this.getGraphElementType()
            ]();
    };

    api.GraphElementUi.prototype.getTextOrDefault = function () {
        var text = this.text();
        return "" === text.trim() ?
            this.getSelector().getWhenEmptyLabel() :
            text;
    };
    api.GraphElementUi.prototype.getSelector = function () {
        return selectors[
            this.getGraphElementType()
            ]();
    };

    api.GraphElementUi.prototype.rightActionForType = function (vertexAction, edgeAction, groupRelationAction, schemaAction, propertyAction, suggestionVertexAction, suggestionRelationAction, metaAction, metaRelationAction) {
        switch (this.getGraphElementType()) {
            case api.Types.Vertex :
                return vertexAction;
            case api.Types.Relation :
                return edgeAction;
            case api.Types.GroupRelation :
                return groupRelationAction;
            case api.Types.Schema :
                return schemaAction;
            case api.Types.Property :
                return propertyAction;
            case api.Types.VertexSuggestion :
                return suggestionVertexAction;
            case api.Types.RelationSuggestion :
                return suggestionRelationAction;
            case api.Types.Meta :
                return metaAction;
            case api.Types.MetaRelation :
                return metaRelationAction;
            default:
                return function () {
                };
        }
    };
    api.GraphElementUi.prototype.cut = function () {
        this.reviewMenuButtonsVisibility();
    };
    api.GraphElementUi.prototype.paste = function () {
        this.reviewMenuButtonsVisibility();
        this.focus();
    };
    api.GraphElementUi.prototype.selectTree = function () {
        var onlyPrepare = true;
        SelectionHandler.removeAll();
        SelectionHandler.addGraphElement(
            this,
            onlyPrepare
        );
        this.visitDescendants(function (bubble) {
            SelectionHandler.addGraphElement(
                bubble, onlyPrepare
            );
        });

    };
    api.GraphElementUi.prototype.focus = function (clickPosition) {
        this.hideMenu();
        this.editMode();
        this._setTextBeforeModification();
        var label = this.getLabel();
        label.maxCharCleanTextApply();
        if(clickPosition){
            label.focusAtPosition(clickPosition);
        }else{
            label.focusEnd();
        }
        this.getHtml().centerOnScreen();
    };
    api.GraphElementUi.prototype._setTextBeforeModification = function () {
        this.getHtml().data(
            textBeforeModificationKey, this.text()
        );
    };
    api.GraphElementUi.prototype.hasTextChangedAfterModification = function () {
        return this.getHtml().data(
                textBeforeModificationKey
            ) !== this.text();
    };
    api.GraphElementUi.prototype.editMode = function () {
        if(!this.isLabelEditable()){
            return;
        }
        this.getLabel().attr(
            "contenteditable",
            "true"
        );
        var $html = this.getHtml();
        this.getHtml().data(
            "previous_draggable_status",
            $html.attr("draggable")
        );
        $html.addClass(
            "edit"
        ).removeAttr(
            "draggable"
        );
        this.getInLabelButtonsContainer().addClass("hidden");
        GraphUi.disableDragScroll();
        GraphUi.lockDragScroll();
        KeyboardActionsHandler.disable();
    };
    api.GraphElementUi.prototype.leaveEditMode = function () {
        var $label = this.getLabel();
        $label.attr(
            "contenteditable",
            "false"
        );
        $label.closest(
            ".graph-element"
        ).removeClass(
            "edit"
        );
        var $html = this.getHtml();
        $html.attr(
            "draggable",
            $html.data("previous_draggable_status")
        );
        this.getInLabelButtonsContainer().removeClass("hidden");
        GraphUi.unlockDragScroll();
        GraphUi.enableDragScroll();
        KeyboardActionsHandler.enable();
    };
    api.GraphElementUi.prototype.isInEditMode = function () {
        return this.getHtml().hasClass("edit");
    };
    api.GraphElementUi.prototype.centerOnScreen = function () {
        this.getHtml().centerOnScreen();
    };

    api.GraphElementUi.prototype.isInTypes = function (types) {
        return $.inArray(
                this.getGraphElementType(),
                types
            ) !== -1;
    };
    api.GraphElementUi.prototype.getHtml = function () {
        return this.html;
    };
    api.GraphElementUi.prototype.rebuildMenuButtons = function () {
        var container = this.getMenuHtml().empty();
        GraphElementMainMenu.addRelevantButtonsInMenu(
            container,
            this.getController()
        );
        this.onlyShowButtonsIfApplicable();
    };
    api.GraphElementUi.prototype.onlyShowButtonsIfApplicable = function () {
        GraphElementMainMenu.onlyShowButtonsIfApplicable(
            this.getController(),
            this
        );
    };
    api.GraphElementUi.prototype.isSuggestion = function () {
        return this.isVertexSuggestion() || this.isRelationSuggestion();
    };
    api.GraphElementUi.prototype.setUri = function (uri) {
        this.html.data(
            "uri",
            uri
        );
    };
    api.GraphElementUi.prototype.getUri = function () {
        return this.html.data(
            "uri"
        );
    };
    api.GraphElementUi.prototype.setNote = function (note) {
        this.html.data("note", note);
    };
    api.GraphElementUi.prototype.getNote = function () {
        if (this.html.data("note") === undefined) {
            this.html.data("note", "");
        }
        return this.html.data("note");
    };
    api.GraphElementUi.prototype.hasNote = function () {
        return this.getNote().trim().length > 0;
    };
    api.GraphElementUi.prototype.getInLabelButtonsContainer = function () {
        return this.getHtml().find(
            ".in-label-buttons"
        );
    };
    api.GraphElementUi.prototype.reviewInLabelButtonsVisibility = function (applyToOtherInstances) {
        var graphElementUi = this;
        this.getInLabelButtonsContainer().find("button").each(function () {
            var button = GraphElementButton.fromHtml($(this));
            var shouldDisplay = button.shouldBeVisibleInGraphElementLabel(graphElementUi);
            button.getHtml()[shouldDisplay ?
                "removeClass" :
                "addClass"
                ]("hidden");
        });
        if (applyToOtherInstances !== undefined && !applyToOtherInstances) {
            return;
        }
        this.applyToOtherInstances(function (otherInstance) {
            otherInstance.reviewInLabelButtonsVisibility(false);
        });
    };

    api.GraphElementUi.prototype.getOtherInstanceButton = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=visitOtherInstances]"
        );
    };

    api.GraphElementUi.prototype.getNoteButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=note]"
        );
    };

    api.GraphElementUi.prototype.getMakePublicButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=makePublic]"
        );
    };

    api.GraphElementUi.prototype.getMakePrivateButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=makePrivate]"
        );
    };

    api.GraphElementUi.prototype.getIdentifyButtonInLabel = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=identify]"
        );
    };

    api.GraphElementUi.prototype.updateInLabelNoteButtonHoverText = function () {
        this.getNoteButtonInBubbleContent().attr(
            "data-original-title",
            this.getNote()
        );
    };

    api.GraphElementUi.prototype.isDisplayingComparison = function () {
        return this.getLabel().find(
                "del,ins"
            ).length > 0;
    };

    api.GraphElementUi.prototype.setComparedWith = function (comparedWith) {
        this.comparedWith = comparedWith;
    };
    api.GraphElementUi.prototype.getComparedWith = function () {
        return this.comparedWith;
    };

    api.GraphElementUi.prototype.refreshComparison = function () {
        if (!this.shouldCompare()) {
            return;
        }
        this.refreshLabelComparison();
    };

    api.GraphElementUi.prototype.shouldCompare = function () {
        return MindMapInfo.isInCompareMode() && !this.isAComparisonSuggestionToRemove() && !this.thisIsAModelSuggestion();

    };

    api.GraphElementUi.prototype.refreshLabelComparison = function () {
        var diffMatchPatch = new diff_match_patch();
        var difference = diffMatchPatch.diff_main(
            this.getModel().getLabel(),
            this.getComparedWith().getLabel()
        );
        diffMatchPatch.diff_cleanupSemantic(difference);
        diffMatchPatch.diff_cleanupEfficiency(difference);
        var textHtml = diffMatchPatch.diff_prettyHtml(difference);
        this.setText(textHtml);
        this.reviewInLabelButtonsVisibility();
    };

    api.GraphElementUi.prototype.isAComparisonSuggestionToAdd = function () {
        return this.getTreeContainer().hasClass(
            "compare-add"
        );
    };

    api.GraphElementUi.prototype.setAsComparisonSuggestionToAdd = function () {
        this.getTreeContainer().addClass(
            "compare-add"
        );
    };

    api.GraphElementUi.prototype.thisIsAModelSuggestion = function () {
        return this.isSuggestion() && !this.getSuggestion().getOrigin().isFromComparison();
    };

    api.GraphElementUi.prototype.setAsComparisonSuggestionToRemove = function () {
        this.getTreeContainer().addClass(
            "compare-remove"
        );
    };

    api.GraphElementUi.prototype.isAComparisonSuggestionToRemove = function () {
        return this.getTreeContainer().hasClass(
            "compare-remove"
        );
    };

    api.GraphElementUi.prototype.quitComparison = function () {
        if (this.isVertexSuggestion()) {
            if (this.getSuggestion().getOrigin().isFromComparison()) {
                this.remove();
            }
        }
        this.setText(
            this.getModel().getLabel()
        );
        this.setComparedWith(undefined);
        this.reviewInLabelButtonsVisibility();
        this.quitCompareAddOrRemoveMode();
    };
    api.GraphElementUi.prototype.quitCompareAddOrRemoveMode = function () {
        this.getTreeContainer().removeClass(
            "compare-add"
        ).removeClass(
            "compare-remove"
        );
    };
    api.GraphElementUi.prototype.labelUpdateHandle = function () {
        var isLabelDifferentThanModel = this.text() !== this.getModel().getLabel();
        if (isLabelDifferentThanModel) {
            this.setText(
                this.getModel().getLabel()
            );
        }
        this.leaveEditMode();
        this.getLabel().maxChar();
        this.getHtml().centerOnScreen();
        if (this.shouldCompare()) {
            this.refreshLabelComparison();
        }
        if (!this.hasTextChangedAfterModification()) {
            return;
        }
        if (!this.isSuggestion()) {
            this._updateLabelsOfElementsWithSameUri();
        }
        SelectionHandler.setToSingleGraphElement(this);
    };

    api.GraphElementUi.prototype.removeSingleSelected = function () {
        this.html.removeClass("single-selected");
    };

    api.GraphElementUi.prototype._updateLabelsOfElementsWithSameUri = function () {
        var text = this.text();
        $.each(this.getOtherInstances(), function () {
            var sameElement = this;
            sameElement.setText(
                text
            );
        });
    };

    api.GraphElementUi.prototype.makeLabelNonEditable = function () {
        this.html.addClass("not-editable");
        this.html.data(
            "non-editable",
            true
        );
    };

    api.GraphElementUi.prototype.isLabelEditable = function () {
        return !this.html.data(
            "non-editable"
        );
    };

    EventBus.subscribe(
        '/event/ui/graph/vertex/privacy/updated',
        function (event, graphElement) {
            graphElement.reviewInLabelButtonsVisibility();
        }
    );
    EventBus.subscribe(
        '/event/ui/graph/element/note/updated',
        function (event, graphElement) {
            graphElement.updateInLabelNoteButtonHoverText();
        }
    );

    EventBus.subscribe(
        '/event/ui/graph/drawn',
        function () {
            if (api.getCenterBubble().getModel().isPublic()) {
                api.activateWikidataForInBubbleEdition();
            } else {
                api.deactivateWikidataForInBubbleEdition();
            }
            GraphElementMainMenu.reviewButtonsVisibility();
        });
    return api;
    function initMenuHandlerGetters() {
        controllerGetters[api.Types.Vertex] = GraphDisplayer.getVertexMenuHandler;
        controllerGetters[api.Types.Relation] = GraphDisplayer.getRelationMenuHandler;
        controllerGetters[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
        controllerGetters[api.Types.Schema] = GraphDisplayer.getSchemaMenuHandler;
        controllerGetters[api.Types.Property] = GraphDisplayer.getPropertyMenuHandler;
        controllerGetters[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionController;
        controllerGetters[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionMenuHandler;
        controllerGetters[api.Types.Meta] = GraphDisplayer.getMetaController;
        controllerGetters[api.Types.MetaRelation] = GraphDisplayer.getMetaRelationController;
    }

    function initSelectors() {
        selectors[api.Types.Vertex] = GraphDisplayer.getVertexSelector;
        selectors[api.Types.Relation] = GraphDisplayer.getEdgeSelector;
        selectors[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationSelector;
        selectors[api.Types.Schema] = GraphDisplayer.getSchemaSelector;
        selectors[api.Types.Property] = GraphDisplayer.getPropertySelector;
        selectors[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionSelector;
        selectors[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionSelector;
        selectors[api.Types.Meta] = GraphDisplayer.getMetaUiSelector;
        selectors[api.Types.MetaRelation] = GraphDisplayer.getMetaUiRelationSelector;
    }
});
