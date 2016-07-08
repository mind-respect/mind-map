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
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_ui",
    "triple_brain.language_manager",
    "triple_brain.id_uri",
    "triple_brain.bubble_cloud_flow",
    "triple_brain.flow",
    "triple_brain.other_user_flow"
], function ($, UserService, EventBus, Header, SelectionHandler, GraphDisplayer, GraphDisplayerFactory, MindMapInfo, GraphElementMainMenu, GraphUi, LanguageManager, IdUriUtils, BubbleCloudFlow, Flow) {
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
            if(centralVertex.isVertex()){
                GraphUi.hideSchemaInstructions();
            }
            centralVertex.setAsCentral();
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
            GraphUi.initDragScroll();
            GraphUi.enableDragScroll();
            SelectionHandler.setToSingleVertex(centralVertex);
            GraphDisplayer.getGraphMenuHandler().zoomOut();
            EventBus.publish('/event/ui/graph/drawn');
            //if (window.callPhantom === 'function') {
            //    window.callPhantom('takeShot');
            //}
        }
    );
    return api;

    function setupMindMap(isAnonymous, isTagCloudFlow) {
        $("body").addClass("no-scroll");
        MindMapInfo.setIsAnonymous(isAnonymous);
        MindMapInfo.setIsTagCloudFlow(isTagCloudFlow);
        Header.earlyInit();
        handleHistoryBrowse();
        if (isAnonymous) {
            loadLocaleAndGraph();
        } else {
            UserService.authenticatedUser(function () {
                MindMapInfo.defineIsViewOnlyIfItsUndefined();
                loadLocaleAndGraph();
            });
        }
        function loadLocaleAndGraph() {
            LanguageManager.loadLocaleContent(function () {
                if(isAnonymous){
                    Header.commonSetupForAnonymous();
                }else{
                    Header.commonSetupForAuthenticated();
                }
                translateText();
                if (isTagCloudFlow) {
                    BubbleCloudFlow.enter();
                    return;
                }
                Flow.showOnlyFlow("mindMap");
                GraphDisplayer.displayForBubbleWithUri(
                    MindMapInfo.getCenterBubbleUri()
                );
                GraphElementMainMenu._getMenu().removeClass("hidden");
                GraphElementMainMenu.reset();
                // EventBus.publish("while-fetching-graph");
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