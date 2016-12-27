/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.tree_edge",
        "triple_brain.edge_ui",
        "triple_brain.event_bus",
        "triple_brain.relative_tree_vertex",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element_main_menu",
        "triple_brain.edge_html_builder_common",
        "triple_brain.graph_element_html_builder",
        "triple_brain.bubble_factory",
        "triple_brain.mind_map_info"
    ],
    function ($, TreeEdge, EdgeUi, EventBus, RelativeTreeVertex, GraphDisplayer, GraphElementMainMenu, EdgeHtmlBuilderCommon, GraphElementHtmlBuilder, BubbleFactory, MindMapInfo) {
        "use strict";
        var api = {};
        api.withServerFacade = function (edgeServer) {
            return new EdgeCreator(
                edgeServer
            );
        };
        api.afterChildBuilt = function (ui, parentUi, childUi) {
            var model = ui.getModel(),
                parentVertexUi = parentUi.isVertex() ?
                    parentUi :
                    parentUi.getParentVertex(),
                isInverse = model.getSourceVertex().getUri() !== parentVertexUi.getUri();
            ui.getHtml().data(
                "source_vertex_id",
                parentVertexUi.getId()
            ).data(
                "destination_vertex_id",
                childUi.getId()
            );
            if (isInverse) {
                ui.inverse();
            }
            model.setSourceVertex(
                isInverse ?
                    childUi.getModel() :
                    parentVertexUi.getModel()
            );
            model.setDestinationVertex(
                isInverse ?
                    parentVertexUi.getModel() :
                    childUi.getModel()
            );
            GraphElementHtmlBuilder.integrateIdentifications(
                ui
            );
            EdgeHtmlBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
                ui
            );
            ui.refreshImages();
            ui.resetOtherInstances();
            ui.reviewInLabelButtonsVisibility();
            if (MindMapInfo.isViewOnly() && "" === ui.text()) {
                ui.getHtml().find(
                    ".label-container"
                ).addClass("hidden");
            }
            var propertiesIndicator = ui.buildHiddenNeighborPropertiesIndicator();
            propertiesIndicator.hide();
            GraphElementHtmlBuilder.setupDragAndDrop(
                ui
            );
            EventBus.publish(
                '/event/ui/html/edge/created/',
                ui
            );
            ui.getHtml().closest(
                ".vertex-tree-container"
            ).find("> .vertical-border").addClass("small");
            ui.reviewEditButtonDisplay();
        };
        function EdgeCreator(edgeServer) {
            this.edgeServer = edgeServer;
            this.uri = edgeServer.getUri();
            this.html = $(
                "<div class='relation graph-element bubble' draggable='false'>"
            ).append("<div class='in-bubble-content'>");
        }

        EdgeCreator.prototype.create = function () {
            this.html.uniqueId();
            var edge = TreeEdge.createFromHtmlAndUri(
                this.html,
                this.uri
            );
            EdgeHtmlBuilderCommon.buildLabel(
                this.html,
                this.edgeServer.getLabel(),
                TreeEdge.getWhenEmptyLabel()
            );
            this.html.append(
                "<span class='connector'>"
            );
            edge.setModel(
                this.edgeServer
            );
            edge.setNote(
                this.edgeServer.getComment()
            );
            buildMenu(edge);
            EdgeHtmlBuilderCommon.buildInLabelButtons(
                edge
            );
            edge.hideMenu();
            edge.addImages(
                this.edgeServer.getImages()
            );
            if (!MindMapInfo.isViewOnly()) {
                addEditButton(
                    edge
                );
            }
            return edge;
        };
        function addEditButton(edge) {
            edge.getHtml().prepend("<i class='fa fa-pencil edit-relation-button'>").click(function () {
                var edge = BubbleFactory.fromSubHtml(
                    $(this)
                );
                edge.setAsNotSameAsGroupRelation();
                edge.focus();
            });
        }

        function buildMenu(edge) {
            var edgeHtml = edge.getHtml(),
                menu = $("<span class='relation-menu menu'>");
            edgeHtml.find(".label-container").append(menu);
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                edge.getController()
            );
        }

        return api;
    }
);