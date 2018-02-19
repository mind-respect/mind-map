/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "require",
        "jquery",
        "triple_brain.vertex_service",
        "triple_brain.point",
        "triple_brain.error",
        "triple_brain.ui.vertex_segments",
        "triple_brain.event_bus",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble",
        "triple_brain.center_bubble",
        "triple_brain.bubble_factory",
        "triple_brain.suggestion_service",
        "triple_brain.id_uri",
        "jquery.center-on-screen",
        "jquery.max_char"
    ],
    function (require, $, VertexService, Point, Error, VertexSegments, EventBus, GraphElementUi, Bubble, CenterBubble, BubbleFactory, SuggestionService, IdUri) {
        "use strict";
        var api = {};
        api.getWhenEmptyLabel = function () {
            return $.t("vertex.default");
        };
        api.buildCommonConstructors = function (api) {
            GraphElementUi.buildCommonConstructors(api);
            api.visitAllVertices = function (visitor) {
                api.visitAll(function (element) {
                    if (element.isVertex()) {
                        visitor(element);
                    }
                });
            };
        };
        api.VertexUi = function (html) {
            this.html = html;
        };

        api.VertexUi.prototype = new Bubble.Bubble();
        api.VertexUi.prototype.init = function () {
            Bubble.Bubble.apply(this, [this.html]);
            return this;
        };

        api.VertexUi.prototype.remove = function (bubbleAbove, bubbleUnder) {
            var parentBubble = this._getParentBubbleToSelectAfterRemove();
            var bubbleToSelect = parentBubble;
            if (!bubbleUnder.isSameBubble(this)) {
                bubbleToSelect = bubbleUnder;
            } else if (!bubbleAbove.isSameBubble(this)) {
                bubbleToSelect = bubbleAbove;
            }
            this.removeConnectedEdges();
            Bubble.Bubble.prototype.remove.call(
                this,
                parentBubble,
                bubbleToSelect
            );
        };

        api.VertexUi.prototype._getParentBubbleToSelectAfterRemove = function () {
            if (this.isCenterBubble()) {
                return undefined;
            }
            var toSelect = this.getParentBubble().getParentBubble();
            if (toSelect.isGroupRelation() && 1 === toSelect.getNumberOfChild()) {
                toSelect = toSelect.getParentBubble();
            }
            return toSelect;
        };

        api.VertexUi.prototype.areSuggestionsShown = function () {
            var areShown = false;
            this.visitAllImmediateChild(function (child) {
                if (child.isSuggestion()) {
                    areShown = child.isVisible();
                    return false;
                }
            });
            return areShown;
        };

        api.VertexUi.prototype.getMakePrivateButton = function () {
            return this.getButtonHtmlHavingAction("makePrivate");
        };

        api.VertexUi.prototype.getMakePublicButton = function () {
            return this.getButtonHtmlHavingAction("makePublic");
        };

        api.VertexUi.prototype.getSegments = function () {
            return VertexSegments.withHtmlVertex(
                this.getInBubbleContainer()
            );
        };

        api.VertexUi.prototype.getGraphElementType = function () {
            return GraphElementUi.Types.Vertex;
        };

        api.VertexUi.prototype.refreshComparison = function () {
            GraphElementUi.GraphElementUi.prototype.refreshComparison.call(
                this
            );
        };

        api.VertexUi.prototype.position = function () {
            return Point.fromCoordinates(
                this.html.offset().left,
                this.html.offset().top
            );
        };
        api.VertexUi.prototype.intersectsWithSegment = function (segment) {
            return this.getSegments().intersectsWithSegment(
                segment
            );
        };
        api.VertexUi.prototype.closestPointToSegment = function (segment) {
            return this.getSegments().closestPointToSegment(
                segment
            );
        };
        api.VertexUi.prototype.intersectionPointWithSegment = function (segmentToCompare) {
            if (!this.intersectsWithSegment(segmentToCompare)) {
                throw(
                    Error.withName(
                        "no_intersection"
                    )
                );
            }
            return this.getSegments().intersectionPointWithSegment(segmentToCompare);
        };

        api.VertexUi.prototype.width = function () {
            return this.html.width();
        };
        api.VertexUi.prototype.height = function () {
            return this.html.height();
        };
        api.VertexUi.prototype.getHtml = function () {
            return this.html;
        };
        api.VertexUi.prototype.hideButtons = function () {
            this.hideMenu();
        };
        api.VertexUi.prototype.showButtons = function () {
            this.showMenu();
        };
        api.VertexUi.prototype.hideMenu = function () {
            this.getMenuHtml().addClass("hidden");
        };
        api.VertexUi.prototype.showMenu = function () {
            this.getMenuHtml().removeClass("hidden");
        };
        api.VertexUi.prototype.connectedEdges = function () {
            var edgesConnectedToVertex = [];
            this.visitConnectedEdges(function (edge) {
                edgesConnectedToVertex.push(edge);
            });
            return edgesConnectedToVertex;
        };
        api.VertexUi.prototype.isConnectedToEdge = function (edge) {
            var isConnected = false;
            this.visitConnectedEdges(function (connected) {
                if (edge.getUri() === connected.getUri()) {
                    isConnected = true;
                    return false;
                }
            });
            return isConnected;
        };

        api.VertexUi.prototype.visitConnectedEdges = function (visitor) {
            this.visitAllConnected(function (connected) {
                if (connected.isEdge()) {
                    visitor(connected);
                }
            });
        };
        api.VertexUi.prototype.applyToConnectedEdges = function (visitor) {
            var connectedEdges = this.connectedEdges();
            for (var i = 0; i < connectedEdges.length; i++) {
                visitor(connectedEdges[i]);
            }
        };
        api.VertexUi.prototype.text = function () {
            return this.getLabel().maxCharCleanText();
        };

        api.VertexUi.prototype.removeConnectedEdges = function () {
            this.applyToConnectedEdges(function (edge) {
                edge.removeFromCache();
                edge.collateralRemove();
            });
        };

        api.VertexUi.prototype.isConnectedToAVertexWithUri = function (uri) {
            var isConnected = false;
            this.visitConnectedEdges(function (edge) {
                var isConnectedToSource = uri === edge.getSourceVertex().getUri();
                var isConnectedToDestination = uri === edge.getDestinationVertex().getUri();
                if (isConnectedToSource || isConnectedToDestination) {
                    isConnected = true;
                    return false;
                }
            });
            return isConnected;
        };

        api.VertexUi.prototype.getSuggestions = function () {
            return this.getModel().getSuggestions();
        };
        api.VertexUi.prototype.hasSuggestions = function () {
            var suggestions = this.getModel().getSuggestions();
            return suggestions !== undefined && suggestions.length > 0;
        };
        api.VertexUi.prototype.addSuggestions = function (suggestions) {
            var existingSuggestions = this.getModel().getSuggestions();
            existingSuggestions = existingSuggestions === undefined ?
                [] :
                existingSuggestions;
            var mergedSuggestions = existingSuggestions.concat(suggestions);
            this.getModel().setSuggestions(mergedSuggestions);
            require("mr.graph-ui-builder").addSuggestionsToVertex(
                this.getModel().getSuggestions(),
                this
            );
            this.centerOnScreen();
        };
        api.VertexUi.prototype.setSuggestions = function (suggestions) {
            this.getModel().setSuggestions(suggestions);
        };

        api.VertexUi.prototype.serverFacade = function () {
            return VertexService;
        };

        api.VertexUi.prototype.removeIdentifier = function (identification) {
            Bubble.Bubble.prototype.removeIdentifier.call(
                this,
                identification
            );
            var suggestions = [],
                urisOfSuggestionsRemoved = [];
            $.each(this.getSuggestions(), function () {
                var suggestion = this;
                if (suggestion.hasIdentificationForOrigin(identification)) {
                    urisOfSuggestionsRemoved.push(
                        suggestion.getUri()
                    );
                } else {
                    suggestions.push(suggestion);
                }
            });
            SuggestionService.remove(
                urisOfSuggestionsRemoved,
                this
            );
            this.setSuggestions(suggestions);
        };

        api.VertexUi.prototype.getLabelContainer = function () {
            return this.html.find('.in-bubble-content-wrapper');
        };

        api.VertexUi.prototype.makePrivate = function () {
            this.getMakePrivateButton().addClass("hidden");
            this.getMakePublicButton().removeClass("hidden");
        };
        api.VertexUi.prototype.makePublic = function () {
            this.getMakePrivateButton().removeClass("hidden");
            this.getMakePublicButton().addClass("hidden");
        };

        api.VertexUi.prototype.inverse = function () {
            var isInverse = this.isInverse();
            this.getHtml()[
                isInverse ?
                    "removeClass" :
                    "addClass"
                ]("inverse");
            var verticalBorders = this.getHtml().closest(
                ".vertex-tree-container"
            ).find(
                "> .vertical-border"
            );
            verticalBorders[
                isInverse ?
                    "removeClass" :
                    "addClass"
                ]("small");
        };

        api.VertexUi.prototype.deselect = function () {
            this.html.removeClass("selected");
            GraphElementUi.resetOtherInstancesDisplay();
            this.removeSingleSelected();
            this.hideButtons();
        };
        api.VertexUi.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.VertexUi.prototype.makeSingleSelected = function () {
            this.html.addClass("single-selected");
            this.showButtons();
        };

        api.VertexUi.prototype.getMenuHtml = function () {
            return this.html.find('.menu');
        };

        api.VertexUi.prototype.isImmediateChildOfGroupRelation = function () {
            return this.getParentBubble().getParentBubble().isGroupRelation();
        };

        api.VertexUi.prototype.beforeConvertToDistantBubbleWithUri = function () {
            this.getHiddenRelationsContainer().showLoading();
        };

        api.VertexUi.prototype.afterConvertToDistantBubbleWithUri = function () {
            this.resetOtherInstances();
            this.reviewInLabelButtonsVisibility(true);
            this.getHiddenRelationsContainer().hideLoading();
        };

        api.VertexUi.prototype.getDeepestChildDistance = function () {
            var depth = -1;
            var childContainer = this.getHtml().parent().parent().find(
                "> .vertices-children-container"
            );
            do {
                depth++;
                childContainer = childContainer.find(
                    "> .vertex-tree-container"
                ).find(
                    "> .vertices-children-container"
                );
            } while (childContainer.length !== 0);
            // divided by 2 because of the edges
            return depth / 2;
        };

        api.VertexUi.prototype.getDropContainer = function () {
            return this.html.find('.bubble-label');
        };

        api.VertexUi.prototype.buildAfterAutocompleteMenu = function (identifier) {
            this.setText(identifier.getLabel());
            this.getController().setLabel(
                identifier.getLabel()
            );
            this.getLabel().maxChar();
            var html = this.getHtml();
            var content = $("<div class='list-group'>").append(
                $('<a href="#" class="list-group-item">').append(
                    $("<span class='badge'>").text("?").popoverLikeToolTip({
                        content: $.t('search.afterSelect.tagAbout'),
                        trigger: "hover"
                    }),
                    $('<h4 class="list-group-item-heading">').append(
                        $("<i class='fa fa-tag'>"),
                        " ",
                        $("<span>").text($.t('search.afterSelect.tag'))
                    )
                ).click(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(event.target).closest(".popover").popover("hide");
                    identify.bind(this)();
                }.bind(this))
            );
            if (IdUri.isGraphElementUriOwnedByCurrentUser(identifier.getExternalResourceUri())) {
                content.append($('<a href="#" class="list-group-item">').append(
                    $("<span class='badge'>").text("?").popoverLikeToolTip({
                        content: $.t('search.afterSelect.mergeAbout'),
                        trigger: "hover"
                    }),
                    $('<h4 class="list-group-item-heading">').append(
                        $("<i class='fa fa-handshake-o'>"),
                        " ",
                        $("<span>").text($.t('search.afterSelect.merge'))
                    )
                    ).click((function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        $(event.target).closest(".popover").popover("hide");
                        this.getController().convertToDistantBubbleWithUri(
                            identifier.getExternalResourceUri()
                        ).fail(identify.bind(this));
                    }.bind(this)))
                );
            }
            this.html.popoverLikeToolTip({
                title: $("<h3>").append(
                    $("<i class='fa fa-circle-o'>"),
                    " ",
                    $("<span>").text(identifier.getLabel())
                ),
                allowMultiplePopoverDisplayed: true,
                content: content,
                trigger: 'manual'
            });
            html.popover('show');

            function identify() {
                identifier.makeGeneric();
                return this.getController().addIdentification(
                    identifier
                );
            }
        };

        api.VertexUi.prototype.buildChildrenIndex = function () {
            var childrenIndex = {};
            var index = 0;
            this.visitAllImmediateChild(function (child) {
                if (child.isRelation()) {
                    setChildVertexIndex(
                        child.getModel().getOtherVertex(
                            this.getModel()
                        ).getUri()
                    );
                } else if (child.isGroupRelation()) {
                    var grandChildIndex = child.buildChildrenIndex();
                    Object.keys(grandChildIndex).sort(function (a, b) {
                        return grandChildIndex[a].index - grandChildIndex[b].index;
                    }).forEach(function (vertexUri) {
                        setChildVertexIndex(vertexUri);
                    });
                }
            }.bind(this));
            return childrenIndex;

            function setChildVertexIndex(childVertexUri) {
                childrenIndex[childVertexUri] = {
                    index: index
                };
                index++;
            }
        };

        api.buildCommonConstructors(api);
        return api;
    }
);
