/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_displayer",
        "triple_brain.vertex_service",
        "triple_brain.point",
        "triple_brain.error",
        "triple_brain.ui.vertex_segments",
        "triple_brain.event_bus",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble",
        "triple_brain.suggestion_service",
        "mr.loading-flow",
        "jquery.center-on-screen",
        "jquery.max_char"
    ],
    function ($, GraphDisplayer, VertexService, Point, Error, VertexSegments, EventBus, GraphElementUi, Bubble, SuggestionService, LoadingFlow) {
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

        api.VertexUi.prototype.remove = function () {
            var parentVertex = this.isCenterBubble() ?
                undefined :
                this.getParentVertex();
            this.removeConnectedEdges();
            Bubble.Bubble.prototype.remove.call(
                this,
                parentVertex
            );
        };

        api.VertexUi.prototype.areSuggestionsShown = function () {
            var areShown = false;
            this.visitAllChild(function (child) {
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
                if (connected.isRelation() || connected.isRelationSuggestion()) {
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
            GraphDisplayer.addSuggestionsToVertex(
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

        api.VertexUi.prototype.removeIdentification = function (identification) {
            Bubble.Bubble.prototype.removeIdentification.call(
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
        api.VertexUi.prototype.getLabel = function () {
            return this.html.find(".bubble-label");
        };
        api.VertexUi.prototype.makePrivate = function () {
            this.getMakePrivateButton().addClass("hidden");
            this.getMakePublicButton().removeClass("hidden");
        };
        api.VertexUi.prototype.makePublic = function () {
            this.getMakePrivateButton().removeClass("hidden");
            this.getMakePublicButton().addClass("hidden");
        };

        api.VertexUi.prototype.deselect = function () {
            this.html.removeClass("selected");
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
        api.VertexUi.prototype.setIncludedVertices = function (includedVertices) {
            this.html.data(
                "includedVertices",
                includedVertices
            );
        };
        api.VertexUi.prototype.hasIncludedGraphElements = function () {
            return Object.keys(this.getIncludedVertices()).length > 0;
        };
        api.VertexUi.prototype.getIncludedVertices = function () {
            return this.html.data("includedVertices");
        };
        api.VertexUi.prototype.setIncludedEdges = function (includedEdges) {
            this.html.data(
                "includedEdges",
                includedEdges
            );
        };
        api.VertexUi.prototype.getIncludedEdges = function () {
            return this.html.data("includedEdges");
        };
        api.VertexUi.prototype.getMenuHtml = function () {
            return this.html.find('.menu');
        };

        api.VertexUi.prototype.isImmediateChildOfGroupRelation = function () {
            return this.getParentBubble().getParentBubble().isGroupRelation();
        };

        api.VertexUi.prototype.beforeConvertToDistantBubbleWithUri = function(){
            LoadingFlow.enter();
        };

        api.VertexUi.prototype.afterConvertToDistantBubbleWithUri = function(){
            LoadingFlow.leave();
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
        api.buildCommonConstructors(api);
        return api;
    }
);
