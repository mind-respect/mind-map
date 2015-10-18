/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "triple_brain.event_bus",
    "triple_brain.header",
    "triple_brain.selection_handler",
    "triple_brain.graph_displayer",
    "triple_brain.graph_displayer_factory",
    "triple_brain.external_page_loader",
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_main_menu",
    "triple_brain.ui.graph",
    "triple_brain.language_manager",
    "triple_brain.id_uri",
    "triple_brain.bubble_cloud_flow"
], function ($, UserService, EventBus, Header, SelectionHandler, GraphDisplayer, GraphDisplayerFactory, ExternalPageLoader, MindMapInfo, GraphElementMainMenu, GraphUi, LanguageManager, IdUriUtils, BubbleCloudFlow) {
    "use strict";
    var api = {};
    api.enterBubbleCloud = function () {
        setupMindMap(false, true);
    };
    api.enterMindMapForAuthenticatedUser = function () {
        setupMindMap(false, false);
    };
    api.enterMindMapForAnonymousUser = function () {
        setupMindMap(true, false);
    };
    EventBus.subscribe(
        '/event/ui/graph/drawing_info/updated/',
        function (event, centralVertexUri) {
            SelectionHandler.removeAll();
            var centralVertex = IdUriUtils.isSchemaUri(centralVertexUri) ?
                GraphDisplayer.getSchemaSelector().get() :
                GraphDisplayer.getVertexSelector().withUri(centralVertexUri)[0];
            centralVertex.setAsCentral();
            GraphUi.enableDragScroll();
            GraphUi.getDrawnGraph().on(
                "click",
                function (event) {
                    if (event.ctrlKey) {
                        return;
                    }
                    SelectionHandler.removeAll();
                }
            );
            GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                EventBus.publish(
                    '/event/ui/vertex/visit_after_graph_drawn',
                    vertex
                );
            });
            GraphDisplayer.getGroupRelationSelector().visitAll(function (groupRelationUi) {
                EventBus.publish(
                    '/event/ui/group_relation/visit_after_graph_drawn',
                    groupRelationUi
                );
            });
            $("body").removeClass("hidden");
            centralVertex.scrollTo();
            SelectionHandler.setToSingleVertex(centralVertex);
            EventBus.publish('/event/ui/graph/drawn');
        }
    );
    return api;

    function setupMindMap(isAnonymous, isTagCloudFlow) {
        MindMapInfo.setIsAnonymous(isAnonymous);
        MindMapInfo.setIsTagCloudFlow(isTagCloudFlow);
        $("#app-presentation").add("#welcome-content").addClass("hidden");
        Header.earlyInit();
        handleHistoryBrowse();
        GraphDisplayer.setImplementation(
            GraphDisplayerFactory.getByName(
                "relative_tree"
            )
        );
        if (isAnonymous) {
            loadLocaleAndGraph();
        } else {
            UserService.authenticatedUser(function () {
                MindMapInfo.defineIsViewOnlyIfUndefined();
                loadLocaleAndGraph();
            });
        }
        function loadLocaleAndGraph() {
            LanguageManager.loadLocaleContent(function () {
                translateText();
                if (isTagCloudFlow) {
                    BubbleCloudFlow.enter();
                    return;
                }
                GraphDisplayer.displayForBubbleWithUri(
                    MindMapInfo.getCenterBubbleUri(),
                    handleGettingGraphError
                );
                GraphElementMainMenu.reset();
            });
        }
    }

    function handleGettingGraphError(xhr) {
        $("body").removeClass("hidden");
        if (403 === xhr.status) {
            ExternalPageLoader.showLinearFlowWithOptions({
                href: "not-allowed.html",
                title: $.t("not_allowed.title")
            });
        } else if (404 === xhr.status) {
            ExternalPageLoader.showLinearFlowWithOptions({
                href: "non-existent.html",
                title: $.t("non_existent.title")
            });
        }
    }

    function handleHistoryBrowse() {
        $(window).on("popstate", function () {
            GraphDisplayer.displayForBubbleWithUri(
                MindMapInfo.getCenterBubbleUri()
            );
        });
    }

    function translateText() {
        $("html").i18n();
    }
});