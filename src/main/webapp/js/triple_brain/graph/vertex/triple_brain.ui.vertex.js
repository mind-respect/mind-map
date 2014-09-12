/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.graph_displayer",
        "triple_brain.vertex_service",
        "triple_brain.id_uri",
        "triple_brain.point",
        "triple_brain.error",
        "triple_brain.ui.vertex_segments",
        "triple_brain.ui.edge",
        "triple_brain.event_bus",
        "triple_brain.image_displayer",
        "triple_brain.ui.identified_graph_element",
        "triple_brain.ui.graph_element",
        "triple_brain.graph_element_button",
        "triple_brain.bubble",
        "jquery.center-on-screen"
    ],
    function ($, GraphDisplayer, VertexService, IdUriUtils, Point, Error, VertexSegments, EdgeUi, EventBus, ImageDisplayer, IdentifiedGraphElementUi, GraphElementUi, GraphElementButton, Bubble) {
        "use strict";
        var api = {};
        api.getWhenEmptyLabel = function () {
            return $.t("vertex.default");
        };
        api.buildCommonConstructors = function (api) {
            var cacheWithIdAsKey = {},
                cacheWithUriAsKey = {};
            api.initCache = function (vertex) {
                cacheWithIdAsKey[vertex.getId()] = vertex;
                updateUriCache(vertex.getUri(), vertex);
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
            api.visitAllVertices = function (visitor) {
                $.each(cacheWithIdAsKey, function () {
                    return visitor(
                        this
                    );
                });
            };

            EventBus.subscribe('/event/ui/graph/reset', emptyCache);
            function emptyCache() {
                cacheWithIdAsKey = {};
                cacheWithUriAsKey = {};
            }

            api.removeVertexFromCache = function (uri, id) {
                var len = cacheWithUriAsKey[uri].length;
                while (len--) {
                    var vertex = cacheWithUriAsKey[uri][len];
                    if (vertex.getId() === uri) {
                        cacheWithUriAsKey.splice(len, 1);
                    }
                }
                delete cacheWithIdAsKey[id];
            };

            function updateUriCache(uri, vertex) {
                if (undefined === cacheWithUriAsKey[uri]) {
                    cacheWithUriAsKey[uri] = [];
                }
                cacheWithUriAsKey[uri].push(vertex);
            }
        };
        api.centralVertex = function () {
            return GraphDisplayer.getVertexSelector().withHtml(
                $('.center-vertex')
            );
        };
        api.getVertexMouseOver = function () {
            return $("body").data("vertex_mouse_over");
        };
        api.setVertexMouseOver = function (vertex) {
            $("body").data("vertex_mouse_over", vertex);
        };
        api.unsetVertexMouseOver = function () {
            $("body").removeData("vertex_mouse_over");
        };
        api.Object = function (html) {
            this.html = html;
            this.bubble = Bubble.withHtmlFacade(this);
        };
        api.Object.prototype = new IdentifiedGraphElementUi.Object;
        api.Object.prototype.init = function () {
            IdentifiedGraphElementUi.Object.apply(this, [this.html]);
            return this;
        };
        api.Object.prototype.setIsPublic = function (isPublic) {
            this.html.data(
                "isPublic",
                isPublic
            );
        };
        api.Object.prototype.suggestionButton = function () {
            return this.html.find('.suggestion');
        };

        api.Object.prototype.centerButton = function () {
            return this.html.find('.center');
        };

        api.Object.prototype.getSegments = function () {
            return VertexSegments.withHtmlVertex(
                this.getInBubbleContainer()
            );
        };
        api.Object.prototype.getMenuButtonsHtml = function () {
            return this.getMenuHtml().find(
                "> button"
            );
        };
        api.Object.prototype.createImageMenu = function () {
            return this.bubble.createImageMenu();
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
        api.Object.prototype.getNumberOfRelationsToFlag = function () {
            return this.getTotalNumberOfEdges() - 1;
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
        api.Object.prototype.getUri = function () {
            return this.html.data(
                "uri"
            );
        };
        api.Object.prototype.setUri = function (uri) {
            this.html.data(
                "uri",
                uri
            );
        };
        api.Object.prototype.isMouseOver = function () {
            var vertexThatIsMouseOver = api.getVertexMouseOver();
            return vertexThatIsMouseOver !== undefined &&
                vertexThatIsMouseOver.equalsVertex(this);
        };
        api.Object.prototype.makeItLowProfile = function () {
            if (!this.isLabelInFocus()) {
                this.unhighlight();
            }
        };
        api.Object.prototype.makeItHighProfile = function () {
            this.highlight();
        };
        api.Object.prototype.hideButtons = function () {
            this.hideMenu();
        };
        api.Object.prototype.showButtons = function () {
            this.showMenu();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenuHtml().hide();
        };
        api.Object.prototype.showMenu = function () {
            this.getMenuHtml().show();
        };
        api.Object.prototype.showCenterButton = function () {
            this.centerButton().hide();
        };
        api.Object.prototype.hideCenterButton = function () {
            this.centerButton().hide();
        };
        api.Object.prototype.highlight = function () {
            this.html.addClass(
                'highlighted'
            );
        };
        api.Object.prototype.unhighlight = function () {
            this.html.removeClass(
                'highlighted'
            );
        };
        api.Object.prototype.connectedEdges = function () {
            return EdgeUi.connectedToVertex(
                this
            );
        };
        api.Object.prototype.isLabelInFocus = function () {
            return this.getLabel().is(":focus");
        };
        api.Object.prototype.focus = function () {
            this.getLabel().focus();
        };
        api.Object.prototype.readjustLabelWidth = function () {
            this.adjustWidthToNumberOfChars();
        };
        api.Object.prototype.text = function () {
            return this.getLabel().val();
        };
        api.Object.prototype.setText = function (label) {
            return this.getLabel().val(
                label
            );
        };
        api.Object.prototype.setNote = function (note) {
            this.html.data("note", note);
        };
        api.Object.prototype.getNote = function () {
            return this.html.data("note");
        };
        api.Object.prototype.hasNote = function () {
            return this.getNote().trim().length > 0;
        };
        api.Object.prototype.getNoteButtonInBubbleContent = function () {
            return this.getInBubbleContainer().find(
                ".note-button"
            );
        };
        api.Object.prototype.getNoteButtonInMenu = function () {
            return this.getMenuHtml().find("> .note-button");
        };
        api.Object.prototype.getInBubbleContainer = function () {
            return this.html.find(
                "> .in-bubble-content"
            );
        };
        api.Object.prototype.hasDefaultText = function () {
            return this.getLabel().val() == api.getWhenEmptyLabel();
        };
        api.Object.prototype.applyStyleOfDefaultText = function () {
            this.getLabel().addClass('when-default-graph-element-text');
        };
        api.Object.prototype.removeStyleOfDefaultText = function () {
            this.getLabel().removeClass('when-default-graph-element-text');
        };
        api.Object.prototype.isCenterVertex = function () {
            return this.html.hasClass("center-vertex");
        };
        api.Object.prototype.removeConnectedEdges = function () {
            var connectedEdges = this.connectedEdges();
            for (var i = 0; i < connectedEdges.length; i++) {
                connectedEdges[i].remove();
            }
        };

        api.Object.prototype.suggestions = function () {
            return this.html.data('suggestions');
        };
        api.Object.prototype.hasSuggestions = function () {
            return this.suggestions().length > 0;
        };
        api.Object.prototype.addSuggestions = function (suggestions) {
            var existingSuggestions = this.html.data('suggestions');
            existingSuggestions = existingSuggestions === undefined ?
                [] :
                existingSuggestions;
            var mergedSuggestions = existingSuggestions.concat(suggestions);
            this.html.data('suggestions', mergedSuggestions);
            mergedSuggestions.length > 0 ?
                this.showSuggestionButton() :
                this.hideSuggestionButton();
        };
        api.Object.prototype.setSuggestions = function (suggestions) {
            this.html.data('suggestions', suggestions);
            suggestions.length > 0 ?
                this.showSuggestionButton() :
                this.hideSuggestionButton();
        };

        api.Object.prototype.integrateIdentification = function (identification) {
            this.bubble.integrateIdentification(identification);
        };

        api.Object.prototype.addImages = function (images) {
            this.bubble.addImages(images);
        };

        api.Object.prototype.refreshImages = function () {
            this.bubble.refreshImages();
        };

        api.Object.prototype.removeImage = function (imageToRemove) {
            this.bubble.removeImage(imageToRemove);
        };
        api.Object.prototype.getImages = function () {
            return this.bubble.getImages();
        };

        api.Object.prototype.serverFacade = function () {
            return VertexService;
        };

        api.Object.prototype.hasImagesMenu = function () {
            return this.bubble.hasImagesMenu();
        };
        api.Object.prototype.getImageMenu = function () {
            return this.bubble.getImageMenu();
        };
        api.Object.prototype.impactOnRemovedIdentification = function (identification) {
            this.bubble.impactOnRemovedIdentification(identification);
            VertexService.getSuggestions(
                this
            );
        };

        api.Object.prototype.showSuggestionButton = function () {
            this.suggestionButton().show();
        };
        api.Object.prototype.hideSuggestionButton = function () {
            this.suggestionButton().hide();
        };
        api.Object.prototype.triggerChange = function () {
            this.html.trigger("change");
        };
        api.Object.prototype.getLabel = function () {
            return this.html.find("input.label");
        };
        api.Object.prototype.equalsVertex = function (otherVertex) {
            return this.getId() == otherVertex.getId();
        };
        api.Object.prototype.scrollTo = function () {
            this.html.centerOnScreen();
        };
        api.Object.prototype.setOriginalServerObject = function (serverJson) {
            this.html.data(
                "originalServerObject",
                serverJson
            );
        };
        api.Object.prototype.getOriginalServerObject = function () {
            return this.html.data(
                "originalServerObject"
            );
        };
        api.Object.prototype.serverFormat = function () {
            return {
                label: this.text(),
                suggestions: this.suggestions(),
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
            this.html.removeClass("public");
            this.setIsPublic(false);
        };
        api.Object.prototype.makePublic = function () {
            this.html.addClass("public");
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
        api.Object.prototype.isSelected = function () {
            return this.html.hasClass("selected");
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
        api.Object.prototype.isAbsoluteDefaultVertex = function () {
            return this.getUri().indexOf("default") !== -1;
        };
        api.Object.prototype.getMenuHtml = function () {
            return this.html.find('> .menu');
        };
        api.Object.prototype.visitMenuButtons = function (visitor) {
            $.each(this.getMenuButtonsHtml(), function () {
                visitor(
                    GraphElementButton.fromHtml(
                        $(this)
                    )
                );
            });
        };
        api.Object.prototype.addChildTree = function () {
            var self = this;
            GraphDisplayer.addChildTree(
                self
            );
        };
        api.buildCommonConstructors(api);
        return api;
    }
);
