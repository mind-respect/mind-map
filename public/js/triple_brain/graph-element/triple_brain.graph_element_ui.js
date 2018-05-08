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
    "triple_brain.id_uri",
    "triple_brain.center_bubble",
    "font-picker",
    "jquery.focus-end",
    "jquery.center-on-screen",
    "jquery.safer-html",
    "jquery.max_char"
], function ($, GraphDisplayer, GraphElementMainMenu, GraphElementButton, GraphElementType, EventBus, MindMapInfo, SelectionHandler, GraphUi, KeyboardActionsHandler, IdUri, CenterBubble, FontPicker) {
    "use strict";
    var api = {},
        otherInstancesKey = "otherInstances",
        textBeforeModificationKey = "textBeforeModification",
        _centralBubble,
        fontPicker;
    api.Types = GraphElementType;
    var controllerGetters = {},
        selectors = {};
    initMenuHandlerGetters();
    initSelectors();

    api.resetOtherInstancesDisplay = function () {
        $("#svg-container").empty();
        $(".in-label-buttons .nb-other-instances").css("visibility", "visible");
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
        return centerBubble.getParentVertex();
    };
    api.buildCommonConstructors = function (api) {
        var cacheWithIdAsKey = {},
            cacheWithUriAsKey = {};
        api.initCache = function (graphElement) {
            cacheWithIdAsKey[graphElement.getId()] = graphElement;
            updateUriCache(graphElement.getHtml().data("uri"), graphElement);
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

    api.GraphElementUi.prototype.hasOtherVisibleInstance = function () {
        if (!this.hasOtherInstances()) {
            return false;
        }
        var hasOtherVisibleInstance = false;
        this.getOtherInstances().forEach(function (otherInstance) {
            if (otherInstance.isVisible()) {
                hasOtherVisibleInstance = true;
            }
        });
        return hasOtherVisibleInstance;
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
        otherInstances.forEach(function (otherInstance) {
            otherInstance.getHtml().find(".nb-other-instances").text(
                otherInstances.length
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
        var font = api.getCenterVertexOrSchema().getModel().getFont();
        var isTesting = window.mindRespectConfig.googleFontsApiKey === "testing";
        if (!fontPicker && !isTesting) {
            fontPicker = new FontPicker.FontPicker(
                window.mindRespectConfig.googleFontsApiKey,
                font.family,
                {
                    limit: 500
                },
                function (font) {
                    api.getCenterVertexOrSchema().getController().setFont(font);
                }
            );
        } else if (!isTesting) {
            fontPicker.setActiveFont(font.family);
        }
        GraphDisplayer.getVertexSelector().visitAll(function(vertexUi){
            vertexUi.refreshFont(font);
        });
        api.visitAll(function (graphElementUi) {
            graphElementUi.refreshFont(font);
        });
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
    api.GraphElementUi.prototype.isGroupVertexUnderMeta = function () {
        return GraphElementType.GroupVertexUnderMeta === this.getGraphElementType();
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
        this.visitMenuButtons(function (button) {
            button.showOnlyIfApplicable(
                this.getController(),
                this
            );
        }.bind(this));
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
        nameParts.forEach(function (namePart) {
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

    api.GraphElementUi.prototype.select = function () {
        this.html.addClass("selected");
    };

    api.GraphElementUi.prototype.isSelected = function () {
        return this.html.hasClass("selected");
    };

    api.GraphElementUi.prototype.makeSingleSelected = function () {
        this.html.addClass("single-selected");
    };

    api.GraphElementUi.prototype.hideMenu = function () {
        this.getMenuHtml().addClass("hidden");
    };
    api.GraphElementUi.prototype.showMenu = function () {
        this.getMenuHtml().removeClass("hidden");
        GraphElementMainMenu.reviewInBubbleButtonsDisplay(this, this.getController());
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
    api.GraphElementUi.prototype.pasteText = function () {
        this.paste();
        this.focus();
    };
    api.GraphElementUi.prototype.pasteBubble = api.GraphElementUi.prototype.paste = function () {
        this.reviewMenuButtonsVisibility();
    };
    api.GraphElementUi.prototype.selectTree = function () {
        var onlyPrepare = true;
        SelectionHandler.removeAll();
        SelectionHandler.addGraphElement(
            this,
            onlyPrepare
        );
        var typesToSelect;
        if (this.isVertex()) {
            typesToSelect = [GraphElementType.Vertex];
        } else if (this.isRelation()) {
            typesToSelect = [GraphElementType.Relation];
        } else {
            typesToSelect = GraphElementType.getAll();
        }
        this.visitDescendants(function (bubble) {
            if (bubble.isInTypes(typesToSelect)) {
                SelectionHandler.addGraphElement(
                    bubble, onlyPrepare
                );
            }
        });

    };
    api.GraphElementUi.prototype.focus = function (clickPosition) {
        this.hideMenu();
        this.editMode();
        this._setTextBeforeModification();
        var label = this.getLabel();
        label.maxCharCleanTextApply();
        if (clickPosition) {
            label.focusAtPosition(clickPosition);
        } else {
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
        if (!this.isLabelEditable()) {
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
        if (this.getModel().isLabelEmpty()) {
            this.getHtml().addClass("empty-label");
        } else {
            this.getHtml().removeClass("empty-label");
        }
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
        this.reviewInLabelButtonsVisibility();
        if (this.isRelation()) {
            this.reviewIsSameAsGroupRelation();
        }
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
    api.GraphElementUi.prototype.isATypeOfEdge = function () {
        return this.isInTypes(
            GraphElementType.getEdgeTypes()
        );
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
        this.html.data("uri", uri);
        this.getModel().setUri(uri);
    };
    api.GraphElementUi.prototype.getUri = function () {
        return this.getModel().getUri();
    };
    api.GraphElementUi.prototype.getInLabelButtonsContainer = function () {
        return this.getHtml().find(
            ".in-label-buttons"
        );
    };
    api.GraphElementUi.prototype.reviewInLabelButtonsVisibility = function (applyToOtherInstances) {
        var graphElementUi = this;
        var promises = this.getInLabelButtonsContainer().find("button").map(function () {
            var button = GraphElementButton.fromHtml($(this));
            return button.shouldBeVisibleInGraphElementLabel(graphElementUi).then(function (shouldDisplay) {
                button.getHtml()[shouldDisplay ?
                    "removeClass" :
                    "addClass"
                    ]("hidden");
            });
        });
        if (applyToOtherInstances !== undefined && !applyToOtherInstances) {
            return;
        }
        $.when.apply($, promises).then(function () {
            var notHiddenButton = this.getInLabelButtonsContainer().find("button:not(.hidden)");
            this.getInLabelButtonsContainer()[notHiddenButton.length > 0 ? 'removeClass' : 'addClass'](
                'hidden'
            );
            this.applyToOtherInstances(function (otherInstance) {
                otherInstance.reviewInLabelButtonsVisibility(false);
            });
        }.bind(this));
    };

    api.GraphElementUi.prototype.getOtherInstanceButton = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=visitOtherInstances]"
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

    api.GraphElementUi.prototype._getInLabelButtonWithAction = function (action) {
        return this.getInLabelButtonsContainer().find(
            "[data-action=" + action + "]"
        );
    };

    api.GraphElementUi.prototype.getIdentifyButtonInLabel = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=identify]"
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
        if (this.isCenterBubble()) {
            document.title = this.getTextOrDefault();
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
        if (SelectionHandler.isEmpty()) {
            SelectionHandler.setToSingleGraphElement(this);
        }
        GraphElementMainMenu.reviewButtonsVisibility(
            this,
            this.getController()
        );
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

    api.GraphElementUi.prototype.getLabel = function () {
        return this.html.find('.bubble-label');
    };

    api.GraphElementUi.prototype.getLabelContainer = function () {
        return this.html.find('.label-container');
    };

    api.GraphElementUi.prototype.isInverse = function () {
        return this.html.hasClass("inverse");
    };

    api.GraphElementUi.prototype.noteInLabelButtonContent = function () {
        return this.getModel().getComment();
    };

    api.GraphElementUi.prototype.getTagNumberOfOtherReferences = function (identifier) {
        return identifier.getNbReferences() - 1;
    };

    api.GraphElementUi.prototype.identifyWhenManyInLabelButtonContent = api.GraphElementUi.prototype.identifyInLabelButtonContent = function () {
        if (!this.getModel().hasRelevantTags()) {
            return "";
        }
        var list = $("<ul  class='list-group'>");
        this.getModel().getRelevantTags().sort(function (a, b) {
            return b.getNbReferences() - a.getNbReferences();
        }).forEach(function (identifier) {
            list.append(
                $("<a class='list-group-item'>").attr(
                    "href",
                    IdUri.htmlUrlForBubbleUri(
                        identifier.getUri()
                    )
                ).append(
                    $("<span class='badge primary'>").text("+ " + this.getTagNumberOfOtherReferences(identifier))
                ).append(
                    $("<span>").text(identifier.getLabel())
                ).mousedown(function () {
                    window.location = $(this).attr("href");
                })
            );
        }.bind(this));
        return list;
    };

    api.GraphElementUi.prototype.showLinesToSimilarInstances = function () {
        var basePosition = this.getOtherInstancesButtonPosition();
        var svgStr = '<svg style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%" version="1.1" xmlns="http://www.w3.org/2000/svg">';
        this.getOtherInstances().forEach(function (otherInstance) {
            var otherPosition = otherInstance.getOtherInstancesButtonPosition();
            otherInstance.getInsideOtherInstancesButton().css("visibility", "hidden");
            var areTheyClose = Math.abs(otherPosition.left - basePosition.left) < 400;
            var yControllPointVariation = areTheyClose ? 15 : 75;
            if (otherPosition.top < basePosition.top) {
                yControllPointVariation *= -1;
            }
            var xControllPointVariation = 0;
            var path = '<path d="M' + basePosition.left + "," + basePosition.top + " C";
            path += basePosition.left + xControllPointVariation + "," + (basePosition.top + yControllPointVariation) + " ";
            path += otherPosition.left - xControllPointVariation + "," + (otherPosition.top + yControllPointVariation) + " ";
            path += otherPosition.left + "," + otherPosition.top + '" ';
            path += 'fill="none" stroke="#E65100" stroke-dasharray="5, 5" stroke-width="2px"/>';
            svgStr += path;
        });
        svgStr += "</svg>";
        this.getInsideOtherInstancesButton().css("visibility", "hidden");
        return $("#svg-container").empty().append(
            svgStr
        );
    };

    api.GraphElementUi.prototype.getOtherInstancesButtonPosition = function () {
        var otherInstancesButton = this.getInsideOtherInstancesButton();
        var position = otherInstancesButton.offset();
        position.left += otherInstancesButton.width() / 2;
        position.top += otherInstancesButton.height() / 2;
        position.left = Math.round(position.left);
        position.top = Math.round(position.top);
        return position;
    };

    api.GraphElementUi.prototype.getInsideOtherInstancesButton = function () {
        return this.getHtml().find(".in-label-buttons .nb-other-instances");
    };

    api.GraphElementUi.prototype.addChildStyleButton = function (button) {
        var addToTheLeft;
        if (this.isCenterBubble()) {
            var centerBubble = CenterBubble.usingBubble(
                this
            );
            addToTheLeft = centerBubble.shouldAddLeft();
        } else {
            addToTheLeft = this.isToTheLeft();
        }
        button.getHtml().find("i")[
            addToTheLeft ? "addClass" : "removeClass"
            ]("fa-rotate");

    };

    api.GraphElementUi.prototype.addChildRightButton = function (button) {
        button.getHtml().find("i").removeClass("fa-rotate");
    };

    api.GraphElementUi.prototype.refreshFont = function (font) {
        font = font || api.getCenterVertexOrSchema().getModel().getFont();
        this.html.find(".bubble-label").css(
            "font-family",
            font.family
        );
    };

    EventBus.subscribe(
        '/event/ui/graph/vertex/privacy/updated',
        function (event, graphElement) {
            graphElement.reviewInLabelButtonsVisibility();
        }
    );

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
        controllerGetters[GraphElementType.GroupVertexUnderMeta] = GraphDisplayer.getGroupVertexUnderMetaController;
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
        selectors[GraphElementType.GroupVertexUnderMeta] = GraphDisplayer.getGroupVertexUnderMetaUiSelector;
    }
});
