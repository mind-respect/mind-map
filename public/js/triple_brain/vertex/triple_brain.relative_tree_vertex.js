/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.vertex_ui",
        "triple_brain.event_bus",
        "triple_brain.tree_edge",
        "triple_brain.object_utils",
        "triple_brain.triple_ui_builder",
        "triple_brain.selection_handler",
        "triple_brain.bubble_factory",
        "triple_brain.mind_map_info",
        "clipboard",
        "triple_brain.bubble",
        "triple_brain.graph_element_ui",
        "triple_brain.id_uri"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, TripleUiBuilder, SelectionHandler, BubbleFactory, MindMapInfo, Clipboard, Bubble, GraphElementUi, IdUri) {
        "use strict";
        var api = {};
        var _shareMenuBuilt = false;
        VertexUi.buildCommonConstructors(api);
        api.createFromHtml = function (html) {
            var vertex = new api.RelativeTreeVertex().init(
                html
            );
            api.initCache(
                vertex
            );
            VertexUi.initCache(
                vertex
            );
            return vertex;
        };
        api.ofVertex = function (vertex) {
            return api.withHtml(
                vertex.getHtml()
            );
        };
        api.VerticesToHtmlLists = function (vertices) {
            var lists = $("<div>");
            var verticesInListById = {};
            vertices.forEach(function (vertex) {
                verticesInListById[vertex.getId()] = {};
            });
            Bubble.sortBubblesByNumberOfParentVerticesAscending(vertices).forEach(function (vertex) {
                if (!shouldIntegrateVertex(vertex)) {
                    return;
                }
                lists.append(
                    integrateBubble(vertex, true)
                );
            });
            return lists;

            function integrateBubble(bubble, isARoot) {
                var html = $(
                    isARoot ? "<div>" : "<li>"
                ).append(bubble.textHtml());
                var ul = $("<ul>");
                bubble.visitAllImmediateChild(function (child) {
                    if (child.isGroupRelation() && !child.getModel().isLabelEmpty()) {
                        ul.append(
                            integrateBubble(child, false)
                        );
                    } else if (child.isATypeOfEdge()) {
                        var childVertex = child.getTopMostChildBubble();
                        if (!shouldIntegrateVertex(childVertex)) {
                            return;
                        }
                        if (!child.getModel().isLabelEmpty() && !child.isSetAsSameAsGroupRelation()) {
                            ul.append(
                                $("<li>").append(
                                    $("<em>").html("(" + child.textHtml() + ")"),
                                    "  ",
                                    childVertex.textHtml()
                                )
                            );
                            verticesInListById[childVertex.getId()].isIntegrated = true;
                        } else {
                            ul.append(
                                integrateBubble(childVertex, false)
                            );
                        }
                    } else if (child.isVertex() && shouldIntegrateVertex(child)) {
                        ul.append(
                            integrateBubble(child, false)
                        );
                    }
                });
                if (ul.find("li").length > 0) {
                    html.append(ul);
                }
                if (verticesInListById[bubble.getId()]) {
                    verticesInListById[bubble.getId()].isIntegrated = true;
                }
                return html;
            }

            function shouldIntegrateVertex(vertex) {
                return verticesInListById[vertex.getId()] && !verticesInListById[vertex.getId()].isIntegrated;
            }
        };
        api = ObjectUtils.makeChildInheritParent(
            api,
            VertexUi
        );
        api.RelativeTreeVertex = function () {
        };

        api.RelativeTreeVertex.prototype = new VertexUi.VertexUi();

        api.RelativeTreeVertex.prototype.init = function (html) {
            this.html = html;
            VertexUi.VertexUi.apply(this, [html]);
            VertexUi.VertexUi.prototype.init.call(
                this
            );
            return this;
        };

        api.RelativeTreeVertex.prototype.visitVerticesChildren = function (visitor) {
            var children = this.getChildrenBubblesHtml();
            $.each(children, function () {
                var bubble = BubbleFactory.fromHtml($(this));
                if (bubble.isRelation()) {
                    var relationChild = bubble.getTopMostChildBubble();
                    if (relationChild.isVertex()) {
                        visitor(relationChild);
                    }
                }
            });
        };
        api.RelativeTreeVertex.prototype.remove = function (applyToOthers) {
            if (applyToOthers === undefined) {
                applyToOthers = true;
            }
            if (this._hasBeenCalledToRemove() || this._isRemoved()) {
                return;
            }
            this._setHasBeenCalledToRemove();
            if (applyToOthers) {
                this.applyToOtherInstances(function (otherInstance) {
                    otherInstance.remove();
                });
            }
            if (this._isRemoved()) {
                return;
            }
            this.visitVerticesChildren(function (childVertex) {
                childVertex.remove();
            });
            if (this._isRemoved()) {
                return;
            }
            var bubbleAbove = this.getBubbleAbove();
            var bubbleUnder = this.getBubbleUnder();
            this.removeFromCache();
            VertexUi.VertexUi.prototype.remove.call(
                this,
                bubbleAbove,
                bubbleUnder
            );
        };
        api.RelativeTreeVertex.prototype._setHasBeenCalledToRemove = function () {
            this.getHtml().data(
                "hasBeenCalledToRemove",
                true
            );
        };
        api.RelativeTreeVertex.prototype._hasBeenCalledToRemove = function () {
            return this.getHtml().data("hasBeenCalledToRemove") === true;
        };
        api.RelativeTreeVertex.prototype.removeFromCache = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            VertexUi.removeFromCache(
                this.getUri(),
                this.getId()
            );
        };
        api.RelativeTreeVertex.prototype.initCache = function () {
            api.initCache(
                this
            );
            VertexUi.initCache(
                this
            );
        };
        api.RelativeTreeVertex.prototype._isRemoved = function () {
            return $.isEmptyObject(
                this.getHtml().data()
            );
        };
        api.RelativeTreeVertex.prototype.getRelationWithUiParent = function () {
            return this.getParentBubble();
        };
        api.RelativeTreeVertex.prototype.isALeaf = function () {
            return !this.hasChildren();
        };

        api.RelativeTreeVertex.prototype.hasHiddenRelations = function () {
            return this.getNumberOfHiddenRelations() > 0;

        };
        api.RelativeTreeVertex.prototype.getNumberOfHiddenRelations = function () {
            if (this.isCenterBubble()) {
                return 0;
            }
            var nbNeighbors;
            if (MindMapInfo.isFriend()) {
                nbNeighbors = this.getModel().getNbFriendNeighbors() + this.getModel().getNbPublicNeighbors();
            } else if (MindMapInfo.isViewOnly()) {
                nbNeighbors = this.getModel().getNbPublicNeighbors();
            } else {
                nbNeighbors = this.getModel().getNumberOfConnectedEdges();
            }
            if (this.isALeaf()) {
                var parentBubble = this.getParentBubble();
                if (parentBubble.getParentBubble().isGroupVertexUnderMeta()) {
                    return nbNeighbors - 2;
                }
                if (parentBubble.isMetaRelation()) {
                    return nbNeighbors;
                }
                return nbNeighbors - 1;
            }
            return 0;
        };

        api.RelativeTreeVertex.prototype.tripleAdded = function (triple) {
            Bubble.Bubble.prototype.tripleAdded.call(
                this,
                triple
            );
            var sourceBubble = triple.sourceVertex();
            if (!sourceBubble.isVertex()) {
                return;
            }
            sourceBubble.applyToOtherInstances(function (otherInstance) {
                TripleUiBuilder.createUsingServerTriple(
                    otherInstance,
                    triple.getServerFormat()
                );
                otherInstance.resetOtherInstances();
            });
            triple.destinationVertex().resetOtherInstances();
            triple.destinationVertex().reviewInLabelButtonsVisibility(true);
        };

        api.RelativeTreeVertex.prototype._hasPublicHiddenRelations = function () {
            return this.getModel().getNbPublicNeighbors() > (
                this.getParentVertex().getModel().isPublic() ? 1 : 0
            );
        };
        api.RelativeTreeVertex.prototype.isVertexAChild = function (otherVertex) {
            return !otherVertex.isCenterBubble() &&
                !otherVertex.isSameBubble(this) &&
                otherVertex.getParentVertex().isSameBubble(this);
        };

        api.setupVertexCopyButton = function (vertex) {
            var button = vertex.getButtonHtmlHavingAction("copy");
            if (button.length === 0) {
                return;
            }
            api.setupCopyButton(
                button[0]
            );
        };

        api.setupCopyButton = function (button) {
            var clipboard = new Clipboard(
                button, {
                    target: function () {
                        var treeListCopyDump = $("#copy-dump");
                        treeListCopyDump.html(
                            api.VerticesToHtmlLists(
                                SelectionHandler.getSelectedVertices()
                            )
                        );
                        return treeListCopyDump[0];
                    }
                }
            );
            clipboard.on("success", function () {
                $("#copy-dump").empty();
            });
        };

        EventBus.subscribe('/event/ui/graph/drawn', function () {
            var expandCalls = [];
            api.visitAllVertices(function (vertexUi) {
                if (vertexUi.getModel().hasOnlyOneHiddenChild() && !vertexUi.isExpanded()) {
                    expandCalls.push(
                        vertexUi.getController().expand(true)
                    );
                }
            });
            $.when.apply($, expandCalls).then(function () {
                GraphElementUi.getCenterVertexOrSchema().sideCenterOnScreenWithAnimation();
            });
            setupCopyButtons();
            if (!_shareMenuBuilt) {
                setupShareMenu();
                _shareMenuBuilt = true;
            }
        });

        function setupCopyButtons() {
            var copyButton = $('.clipboard-copy-button')[0];
            if (!copyButton) {
                return;
            }
            $.each($('.clipboard-copy-button'), function () {
                api.setupCopyButton(this);
            });
        }

        return api;

        function setupShareMenu() {
            $("#share-menu-copy-success").addClass("hidden");
            var $shareMenu = $("#share-menu");
            var $copyShareLinkBtn = $("#copy-share-link").prop('disabled', false);
            var clipboard = new Clipboard(
                $copyShareLinkBtn[0], {
                    target: function () {
                        var treeListCopyDump = $("#copy-dump");
                        treeListCopyDump.text(
                            IdUri.absoluteUrlForBubbleUri(
                                SelectionHandler.getSingleElement().getModel().getUri()
                            )
                        );
                        return treeListCopyDump[0];
                    }.bind(this)
                }
            );
            clipboard.on("success", function () {
                $("#copy-dump").empty();
                $("#share-menu-copy-success").removeClass("hidden");
            });
            var $radios = $shareMenu.find("input[name=shareLevel]");
            $radios.change(function () {
                if (this.value === "private") {
                    $copyShareLinkBtn.prop('disabled', true);
                } else {
                    $copyShareLinkBtn.prop('disabled', false);
                }
                SelectionHandler.getControllerFromCurrentSelection().setShareLevel(this.value).then(function () {
                    $shareMenu.modal('hide');
                });
            });
        }
    }
);
