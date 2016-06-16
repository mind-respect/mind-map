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
        "triple_brain.edge_ui",
        "triple_brain.event_bus",
        "triple_brain.identified_bubble",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble",
        "triple_brain.suggestion_service",
        "jquery.center-on-screen",
        "jquery.max_char"
    ],
    function ($, GraphDisplayer, VertexService, Point, Error, VertexSegments, EdgeUi, EventBus, IdentifiedBubble, GraphElementUi, Bubble, SuggestionService) {
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
        api.centralVertex = function () {
            return GraphDisplayer.getVertexSelector().withHtml(
                $('.center-vertex')
            );
        };
        api.Object = function (html) {
            this.html = html;
        };
        api.Object.prototype = new IdentifiedBubble.Object();
        api.Object.prototype.init = function () {
            IdentifiedBubble.Object.apply(this, [this.html]);
            return this;
        };

        api.Object.prototype.remove = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            this.removeConnectedEdges();
            Bubble.Self.prototype.remove.call(
                this
            );
        };

        api.Object.prototype.setIsPublic = function (isPublic) {
            this.html.data(
                "isPublic",
                isPublic
            );
        };

        api.Object.prototype.areSuggestionsShown = function () {
            var areShown = false;
            this.visitAllChild(function (child) {
                if (child.isSuggestion()) {
                    areShown = child.isVisible();
                    return false;
                }
            });
            return areShown;
        };

        api.Object.prototype.centerButton = function () {
            return this.html.find('.center');
        };

        api.Object.prototype.getMakePrivateButton = function () {
            return this.getMenuHtml().find("button[data-action=makePrivate]");
        };

        api.Object.prototype.getMakePublicButton = function () {
            return this.getMenuHtml().find("button[data-action=makePublic]");
        };

        api.Object.prototype.getSegments = function () {
            return VertexSegments.withHtmlVertex(
                this.getInBubbleContainer()
            );
        };

        api.Object.prototype.getGraphElementType = function () {
            return GraphElementUi.Types.Vertex;
        };
        api.Object.prototype.position = function () {
            return Point.fromCoordinates(
                this.html.offset().left,
                this.html.offset().top
            );
        };
        api.Object.prototype.intersectsWithSegment = function (segment) {
            return this.getSegments().intersectsWithSegment(
                segment
            );
        };
        api.Object.prototype.closestPointToSegment = function (segment) {
            return this.getSegments().closestPointToSegment(
                segment
            );
        };
        api.Object.prototype.intersectionPointWithSegment = function (segmentToCompare) {
            if (!this.intersectsWithSegment(segmentToCompare)) {
                throw(
                    Error.withName(
                        "no_intersection"
                    )
                );
            }
            return this.getSegments().intersectionPointWithSegment(segmentToCompare);
        };
        api.Object.prototype.setAsNonCentral = function () {
            this.html.removeClass('center-vertex');
            this.showCenterButton();
        };
        api.Object.prototype.setAsCentral = function () {
            var previousCentralVertex = api.centralVertex();
            if (previousCentralVertex !== undefined) {
                previousCentralVertex.setAsNonCentral();
            }
            this.html.addClass('center-vertex');
            this.hideCenterButton();
        };
        api.Object.prototype.setTotalNumberOfEdges = function (totalNumberOfEdges) {
            this.html.data(
                "totalNumberOfEdges",
                totalNumberOfEdges
            );
        };

        api.Object.prototype.getTotalNumberOfEdges = function () {
            return this.html.data(
                "totalNumberOfEdges"
            );
        };

        api.Object.prototype.width = function () {
            return this.html.width();
        };
        api.Object.prototype.height = function () {
            return this.html.height();
        };
        api.Object.prototype.getHtml = function () {
            return this.html;
        };
        api.Object.prototype.hideButtons = function () {
            this.hideMenu();
        };
        api.Object.prototype.showButtons = function () {
            this.showMenu();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenuHtml().addClass("hidden");
        };
        api.Object.prototype.showMenu = function () {
            this.getMenuHtml().removeClass("hidden");
        };
        api.Object.prototype.showCenterButton = function () {
            this.centerButton().addClass("hidden");
        };
        api.Object.prototype.hideCenterButton = function () {
            this.centerButton().removeClass("hidden");
        };
        api.Object.prototype.connectedEdges = function () {
            return EdgeUi.connectedToVertex(
                this
            );
        };
        api.Object.prototype.applyToConnectedEdges = function (visitor) {
            var connectedEdges = this.connectedEdges();
            for (var i = 0; i < connectedEdges.length; i++) {
                visitor(connectedEdges[i]);
            }
        };
        api.Object.prototype.text = function () {
            return this.getLabel().maxCharCleanText();
        };

        api.Object.prototype.removeConnectedEdges = function () {
            this.applyToConnectedEdges(function (edge) {
                edge.remove();
            });
        };

        api.Object.prototype.getSuggestions = function () {
            return this.html.data('suggestions');
        };
        api.Object.prototype.hasSuggestions = function () {
            var suggestions = this.getSuggestions();
            return suggestions !== undefined && suggestions.length > 0;
        };
        api.Object.prototype.addSuggestions = function (suggestions) {
            var existingSuggestions = this.html.data('suggestions');
            existingSuggestions = existingSuggestions === undefined ?
                [] :
                existingSuggestions;
            var mergedSuggestions = existingSuggestions.concat(suggestions);
            this.setSuggestions(mergedSuggestions);
            GraphDisplayer.showSuggestions(this);
            this.centerOnScreen();
        };
        api.Object.prototype.setSuggestions = function (suggestions) {
            this.html.data('suggestions', suggestions);
        };

        api.Object.prototype.serverFacade = function () {
            return VertexService;
        };

        api.Object.prototype.impactOnRemovedIdentification = function (identification) {
            Bubble.Self.prototype.impactOnRemovedIdentification.call(
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
        api.Object.prototype.getLabel = function () {
            return this.html.find(".bubble-label");
        };
        api.Object.prototype.scrollTo = function () {
            this.html.centerOnScreen();
        };
        api.Object.prototype.serverFormat = function () {
            return {
                label: this.text(),
                getSuggestions: this.getSuggestions(),
                types: getCollectionAsServerFormat(this.getTypes()),
                same_as: getCollectionAsServerFormat(this.getSameAs())
            };
            function getCollectionAsServerFormat(collection) {
                var serverFormat = [];
                $.each(collection, function () {
                    var item = this;
                    serverFormat.push(
                        item.getJsonFormat()
                    );
                });
                return serverFormat;
            }
        };
        api.Object.prototype.makePrivate = function () {
            this.setIsPublic(false);
        };
        api.Object.prototype.makePublic = function () {
            this.setIsPublic(true);
        };
        api.Object.prototype.isPublic = function () {
            return this.html.data("isPublic");
        };

        api.Object.prototype.deselect = function () {
            this.html.removeClass("selected");
            this.hideButtons();
        };
        api.Object.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.Object.prototype.makeSingleSelected = function () {
            this.showButtons();
        };
        api.Object.prototype.setIncludedVertices = function (includedVertices) {
            this.html.data(
                "includedVertices",
                includedVertices
            );
        };
        api.Object.prototype.hasIncludedGraphElements = function () {
            return Object.keys(this.getIncludedVertices()).length > 0;
        };
        api.Object.prototype.getIncludedVertices = function () {
            return this.html.data("includedVertices");
        };
        api.Object.prototype.setIncludedEdges = function (includedEdges) {
            this.html.data(
                "includedEdges",
                includedEdges
            );
        };
        api.Object.prototype.getIncludedEdges = function () {
            return this.html.data("includedEdges");
        };
        api.Object.prototype.getMenuHtml = function () {
            return this.html.find('.menu');
        };
        api.Object.prototype.addChildTree = function (callback) {
            var self = this;
            return GraphDisplayer.addChildTree(
                self,
                callback
            );
        };

        api.Object.prototype.hasDragOver = function () {
            return this.getHtml().hasClass("drag-over");
        };

        api.Object.prototype.enterDragOver = function () {
            this.getHtml().addClass("drag-over");
        };

        api.Object.prototype.leaveDragOver = function () {
            this.getHtml().removeClass("drag-over");
        };
        api.Object.prototype.getDeepestChildDistance = function () {
            var depth = -1;
            var childContainer = this.getHtml().parent().parent().find(
                "> .vertices-children-container"
            );
            do{
                depth++;
                childContainer = childContainer.find(
                    "> .vertex-tree-container"
                ).find(
                    "> .vertices-children-container"
                );
            }while(childContainer.length !== 0);
            // divided by 2 because of the edges
            return depth / 2;
        };
        api.buildCommonConstructors(api);
        return api;
    }
);
