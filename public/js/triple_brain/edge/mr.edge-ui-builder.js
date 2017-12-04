/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element_main_menu",
        "mr.edge-ui-builder-common",
        "triple_brain.graph_element_html_builder",
        "triple_brain.bubble_factory",
        "triple_brain.mind_map_info"
    ],
    function ($, EventBus, GraphDisplayer, GraphElementMainMenu, EdgeUiBuilderCommon, GraphElementHtmlBuilder, BubbleFactory, MindMapInfo) {
        "use strict";
        var api = {};
        api.withOptions = function (options) {
            return new api.EdgeUiBuilder(
                options
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
            ui.getHtml().closest(
                ".vertex-tree-container"
            ).find("> .vertical-border").addClass("small");
            if (isInverse) {
                ui.inverse();
            }
            if (!MindMapInfo.isViewOnly()) {
                GraphElementHtmlBuilder.setupDrag(ui);
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
            EdgeUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
                ui
            );
            GraphElementHtmlBuilder._setupChildrenContainerDragOverAndDrop(
                ui
            );
            ui.refreshImages();
            ui.resetOtherInstances();
            ui.reviewInLabelButtonsVisibility();
            if (MindMapInfo.isViewOnly() && ("" === ui.text() || ui.isSetAsSameAsGroupRelation())) {
                ui.hideLabel();
            }
            var propertiesIndicator = ui.buildHiddenNeighborPropertiesIndicator();
            propertiesIndicator.hide();
            GraphElementHtmlBuilder.setupDrop(
                ui
            );
            EventBus.publish(
                '/event/ui/html/edge/created/',
                ui
            );
            ui.reviewEditButtonDisplay();
            GraphElementHtmlBuilder.completeBuild(
                ui
            );
        };
        api.EdgeUiBuilder = function (options) {
            this.options = options || {};
        };

        api.EdgeUiBuilder.prototype.create = function (edgeServer) {
            this.edgeServer = edgeServer;
            this.uri = edgeServer.getUri();
            this.html = $(
                "<div class='relation graph-element bubble' draggable='false'>"
            ).addClass(
                this.options.htmlClass
            ).append("<div class='in-bubble-content'>").data(
                "uri",
                this.uri
            );
            this.html.uniqueId();
            var uiObjectClass = BubbleFactory.getUiObjectClassFromHtml(this.html);
            var edgeUi = uiObjectClass.createFromHtml(
                this.html
            );
            EdgeUiBuilderCommon.buildLabel(
                edgeUi,
                this.edgeServer.getLabel(),
                uiObjectClass.getWhenEmptyLabel(),
                this.options.isViewOnly
            );
            this.html.append(
                "<span class='connector'>"
            );
            edgeUi.setModel(
                this.edgeServer
            );
            buildMenu(edgeUi);
            EdgeUiBuilderCommon.buildInLabelButtons(
                edgeUi
            );
            edgeUi.hideMenu();
            edgeUi.addImages(
                this.edgeServer.getImages()
            );
            if (!MindMapInfo.isViewOnly()) {
                addEditButton(
                    edgeUi
                );
            }
            return edgeUi;
        };

        api.EdgeUiBuilder.prototype.getClass = function(){
            return api;
        };

        function addEditButton(edge) {
            edge.getHtml().prepend("<i class='fa fa-pencil edit-relation-button on-edge-button'>").click(function () {
                var edge = BubbleFactory.fromSubHtml(
                    $(this)
                );
                if(!edge.isSetAsSameAsGroupRelation()){
                    return;
                }
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