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
    "jquery.focus-end",
    "jquery.center-on-screen",
    "jquery.safer-html",
    "jquery.max_char"
], function ($, GraphDisplayer, GraphElementMainMenu, GraphElementButton, GraphElementType, EventBus, MindMapInfo, SelectionHandler) {
    "use strict";
    var api = {},
        otherInstancesKey = "otherInstances",
        textBeforeModificationKey = "textBeforeModification";
    api.Types = GraphElementType;
    var controllerGetters = {},
        selectors = {};
    initMenuHandlerGetters();
    initSelectors();
    api.buildCommonConstructors = function (api) {
        var cacheWithIdAsKey = {},
            cacheWithUriAsKey = {};
        api.initCache = function (graphElement) {
            cacheWithIdAsKey[graphElement.getId()] = graphElement;
            updateUriCache(graphElement.getUri(), graphElement);
        };
        api.withHtml = function (html) {
            return cacheWithIdAsKey[
                html.prop('id')
                ];
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
            var len = cacheWithUriAsKey[uri].length;
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

    api.Self = function () {
    };
    api.Self.prototype.setModel = function (serverJson) {
        this.model = serverJson;
    };
    api.Self.prototype.getModel = function () {
        return this.model;
    };
    api.Self.prototype.getId = function () {
        return this.getHtml().attr("id");
    };
    api.Self.prototype.hasTheDuplicateButton = function () {
        return !this.getOtherInstanceButton().hasClass(
            "hidden"
        );
    };

    api.Self.prototype.hasOtherInstances = function () {
        return this.getOtherInstances().length > 0;
    };

    api.Self.prototype.getOtherInstances = function () {
        if (this.html.data(otherInstancesKey) === undefined) {
            this._defineSameInstances();
        }
        return this.html.data(otherInstancesKey);
    };

    api.Self.prototype._defineSameInstances = function () {
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
    api.Self.prototype.applyToOtherInstances = function (apply) {
        $.each(this.getOtherInstances(), function () {
            var element = this;
            apply(element);
        });
    };

    api.Self.prototype.resetOtherInstances = function () {
        this._resetOtherInstancesNonDeep();
        this.applyToOtherInstances(function (otherInstance) {
            otherInstance._resetOtherInstancesNonDeep();
        });
    };

    api.Self.prototype._resetOtherInstancesNonDeep = function () {
        this.html.removeData(otherInstancesKey);
    };

    api.Self.prototype.isVertex = function () {
        return this.getGraphElementType() === api.Types.Vertex;
    };
    api.Self.prototype.isCenterBubble = function () {
        return this.html.hasClass("center-vertex");
    };
    api.Self.prototype.isSchema = function () {
        return this.getGraphElementType() === api.Types.Schema;
    };
    api.Self.prototype.isRelation = function () {
        return this.getGraphElementType() === api.Types.Relation;
    };
    api.Self.prototype.isGroupRelation = function () {
        return this.getGraphElementType() === api.Types.GroupRelation;
    };
    api.Self.prototype.isProperty = function () {
        return this.getGraphElementType() === api.Types.Property;
    };
    api.Self.prototype.isVertexSuggestion = function () {
        return this.getGraphElementType() === api.Types.VertexSuggestion;
    };
    api.Self.prototype.isRelationSuggestion = function () {
        return this.getGraphElementType() === api.Types.RelationSuggestion;
    };
    api.Self.prototype.isInTheRelationFamily = function () {
        return this.getHtml().hasClass("relation");
    };
    api.Self.prototype.getSimilarButtonHtml = function (button) {
        return this.getButtonHtmlHavingAction(
            button.getAction()
        );
    };
    api.Self.prototype.getButtonHtmlHavingAction = function (action) {
        return this.getMenuHtml().find(
            "[data-action=" + action + "]"
        );
    };
    api.Self.prototype.getController = function () {
        var controller = controllerGetters[
            this.getGraphElementType()
            ]();
        return new controller.Self(this);
    };

    api.Self.prototype.getTextOrDefault = function () {
        var text = this.text();
        return "" === text.trim() ?
            this.getSelector().getWhenEmptyLabel() :
            text;
    };
    api.Self.prototype.getSelector = function () {
        return selectors[
            this.getGraphElementType()
            ]();
    };

    api.Self.prototype.rightActionForType = function (vertexAction, edgeAction, groupRelationAction, schemaAction, propertyAction, suggestionVertexAction, suggestionRelationAction) {
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
            default:
                return function () {
                };
        }
    };
    api.Self.prototype.focus = function () {
        this.editMode();
        this._setTextBeforeModification();
        this.getLabel().maxCharCleanTextApply().focusEnd();
        this.getHtml().centerOnScreen();
    };
    api.Self.prototype._setTextBeforeModification = function () {
        this.getHtml().data(
            textBeforeModificationKey, this.text()
        );
    };
    api.Self.prototype.hasTextChangedAfterModification = function () {
        return this.getHtml().data(
                textBeforeModificationKey
            ) !== this.text();
    };
    api.Self.prototype.editMode = function () {
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
    };
    api.Self.prototype.leaveEditMode = function () {
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
    };
    api.Self.prototype.isInEditMode = function () {
        return this.getHtml().hasClass("edit");
    };
    api.Self.prototype.centerOnScreen = function () {
        this.getHtml().centerOnScreen();
    };
    api.Self.prototype.isInTypes = function (types) {
        return $.inArray(
                this.getGraphElementType(),
                types
            ) !== -1;
    };
    api.Self.prototype.getHtml = function () {
        return this.html;
    };
    api.Self.prototype.rebuildMenuButtons = function () {
        var container = this.getMenuHtml().empty();
        GraphElementMainMenu.addRelevantButtonsInMenu(
            container,
            this.getController()
        );
        this.onlyShowButtonsIfApplicable();
    };
    api.Self.prototype.onlyShowButtonsIfApplicable = function () {
        GraphElementMainMenu.onlyShowButtonsIfApplicable(
            this.getController(),
            this
        );
    };
    api.Self.prototype.isSuggestion = function () {
        return this.isVertexSuggestion() || this.isRelationSuggestion();
    };
    api.Self.prototype.setUri = function (uri) {
        this.html.data(
            "uri",
            uri
        );
    };
    api.Self.prototype.getUri = function () {
        return this.html.data(
            "uri"
        );
    };
    api.Self.prototype.setNote = function (note) {
        this.html.data("note", note);
    };
    api.Self.prototype.getNote = function () {
        if (this.html.data("note") === undefined) {
            this.html.data("note", "");
        }
        return this.html.data("note");
    };
    api.Self.prototype.hasNote = function () {
        return this.getNote().trim().length > 0;
    };
    api.Self.prototype.getInLabelButtonsContainer = function () {
        return this.getHtml().find(
            ".in-label-buttons"
        );
    };
    api.Self.prototype.reviewInLabelButtonsVisibility = function (applyToOtherInstances) {
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

    api.Self.prototype.getOtherInstanceButton = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=visitOtherInstances]"
        );
    };

    api.Self.prototype.getNoteButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=note]"
        );
    };

    api.Self.prototype.getMakePublicButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=makePublic]"
        );
    };

    api.Self.prototype.getMakePrivateButtonInBubbleContent = function () {
        return this.getInLabelButtonsContainer().find(
            "[data-action=makePrivate]"
        );
    };

    api.Self.prototype.updateInLabelNoteButtonHoverText = function () {
        var noteWithoutHtml = $("<div/>").html(
            this.getNote()
        ).text();
        this.getNoteButtonInBubbleContent().attr(
            "title",
            noteWithoutHtml
        );
    };

    api.Self.prototype.isDisplayingComparison = function () {
        return this.getLabel().find(
                "del,ins"
            ).length > 0;
    };

    api.Self.prototype.setComparedWith = function (comparedWith) {
        this.comparedWith = comparedWith;
    };
    api.Self.prototype.getComparedWith = function () {
        return this.comparedWith;
    };

    api.Self.prototype.refreshComparison = function () {
        if (!this.shouldCompare()) {
            return;
        }
        this.refreshLabelComparison();
    };

    api.Self.prototype.shouldCompare = function () {
        return MindMapInfo.isInCompareMode() && !this.isAComparisonSuggestionToRemove();
    };

    api.Self.prototype.refreshLabelComparison = function () {
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

    api.Self.prototype.isAComparisonSuggestionToAdd = function () {
        return this.getTreeContainer().hasClass(
            "compare-add"
        );
    };

    api.Self.prototype.setAsComparisonSuggestionToAdd = function () {
        this.getTreeContainer().addClass(
            "compare-add"
        );
    };

    api.Self.prototype.setAsComparisonSuggestionToRemove = function () {
        this.getTreeContainer().addClass(
            "compare-remove"
        );
    };

    api.Self.prototype.isAComparisonSuggestionToRemove = function () {
        return this.getTreeContainer().hasClass(
            "compare-remove"
        );
    };

    api.Self.prototype.quitComparison = function () {
        this.setText(
            this.getModel().getLabel()
        );
        this.setComparedWith(undefined);
        this.reviewInLabelButtonsVisibility();
        this.quitCompareAddOrRemoveMode();
    };
    api.Self.prototype.quitCompareAddOrRemoveMode = function () {
        this.getTreeContainer().removeClass(
            "compare-add"
        ).removeClass(
            "compare-remove"
        );
    };
    api.Self.prototype.labelUpdateHandle = function () {
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

    api.Self.prototype._updateLabelsOfElementsWithSameUri = function () {
        var text = this.text();
        $.each(this.getOtherInstances(), function () {
            var sameElement = this;
            sameElement.setText(
                text
            );
        });
    };

    EventBus.subscribe(
        '/event/ui/graph/identification/added',
        identificationAddedHandler
    );
    function identificationAddedHandler(event, graphElement, identification) {
        graphElement.applyToOtherInstances(function (otherInstance) {
            var addAction = identification.rightActionForType(
                graphElement.addType,
                graphElement.addSameAs,
                graphElement.addGenericIdentification
            );
            addAction.call(
                otherInstance,
                identification
            );
        });

        api.visitAll(function (visitedGraphElement) {
            if (visitedGraphElement.getUri() === identification.getExternalResourceUri()) {
                if (!visitedGraphElement.hasIdentification(identification)) {
                    visitedGraphElement.addGenericIdentification(
                        identification
                    );
                }
            }
        });
        graphElement.reviewInLabelButtonsVisibility();
    }

    EventBus.subscribe(
        '/event/ui/graph/identification/removed',
        identificationRemovedHandler
    );
    EventBus.subscribe(
        '/event/ui/graph/vertex/privacy/updated',
        function (event, graphElement) {
            graphElement.reviewInLabelButtonsVisibility();
        }
    );
    EventBus.subscribe(
        '/event/ui/graph/vertex/note/updated',
        function (event, graphElement) {
            graphElement.updateInLabelNoteButtonHoverText();
        }
    );

    function identificationRemovedHandler(event, graphElement, identification) {
        graphElement.applyToOtherInstances(function (vertex) {
            var removeAction = identification.rightActionForType(
                graphElement.removeType,
                graphElement.removeSameAs,
                graphElement.removeGenericIdentification
            );
            removeAction.call(
                vertex,
                identification
            );
        });
        graphElement.reviewInLabelButtonsVisibility();
    }

    return api;
    function initMenuHandlerGetters() {
        controllerGetters[api.Types.Vertex] = GraphDisplayer.getVertexMenuHandler;
        controllerGetters[api.Types.Relation] = GraphDisplayer.getRelationMenuHandler;
        controllerGetters[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
        controllerGetters[api.Types.Schema] = GraphDisplayer.getSchemaMenuHandler;
        controllerGetters[api.Types.Property] = GraphDisplayer.getPropertyMenuHandler;
        controllerGetters[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionController;
        controllerGetters[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionMenuHandler;
    }

    function initSelectors() {
        selectors[api.Types.Vertex] = GraphDisplayer.getVertexSelector;
        selectors[api.Types.Relation] = GraphDisplayer.getEdgeSelector;
        selectors[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationSelector;
        selectors[api.Types.Schema] = GraphDisplayer.getSchemaSelector;
        selectors[api.Types.Property] = GraphDisplayer.getPropertySelector;
        selectors[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionSelector;
        selectors[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionSelector;
    }
});
