/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.ui_utils",
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
    "triple_brain.bubble_factory",
    "triple_brain.identification_menu",
    "triple_brain.image_menu",
    "triple_brain.other_user_flow"
], function ($, UiUtils, UserService, EventBus, Header, SelectionHandler, GraphDisplayer, GraphDisplayerFactory, MindMapInfo, GraphElementMainMenu, GraphUi, LanguageManager, IdUriUtils, BubbleCloudFlow, Flow, BubbleFactory, IdentificationMenu, ImageMenu, html2canvas) {
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
        '/event/ui/user/get_authenticated/success',
        function(event, authenticatedUser){
            var isADevUser = [
                "spdupuis",
                "vince"
            ].indexOf(authenticatedUser.user_name) !== -1;
            var devOnlyHtml = $(".dev-only");
            if(isADevUser){
                devOnlyHtml.removeClass("hidden");
            }else{
                devOnlyHtml.remove();
            }
        }
    );
    EventBus.subscribe(
        '/event/ui/graph/drawing_info/updated/',
        function (event, centralBubbleUri) {
            SelectionHandler.removeAll();
            GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
            console.log("Les couleurs");
            console.log(vertex.getModel().getColors());
            console.log("Les étiquettes");
            console.log(vertex.getModel().getLabel());
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
            var centralBubble = BubbleFactory.getGraphElementFromUri(
                centralBubbleUri
            );
            var backgroundColor = centralBubble.getModel().getColors().background;
                        debugger;

            if (backgroundColor) {
                GraphUi.changeBackgroundColor(backgroundColor);
            }
            document.title = centralBubble.getTextOrDefault() + " | MindRespect";
            if(MindMapInfo.isViewOnly()){
                GraphUi.getDrawnGraph().find(".bubble").addClass("not-editable");
            }
            if (centralBubble.isSchema() && !MindMapInfo.isViewOnly()) {
                GraphUi.showSchemaInstructions();
            } else {
                GraphUi.hideSchemaInstructions();
            }
            centralBubble.setAsCentral();
            GraphUi.getDrawnGraph().on(
                "mousedown",
                function (event) {
                    var clickedOnSomethingInsideABubble = $(event.target).closest(".bubble").length === 1;
                    if(clickedOnSomethingInsideABubble){
                        return;
                    }
                    if (UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey)
                    {
                        return;
                    }
                    GraphUi.removePopovers();
                    SelectionHandler.removeAll();
                }
            );
            $("body").removeClass(
                "hidden"
            ).addClass("mind-map-flow");

            /*
            * scrollTo center bubble before affix whole-graph-buttons-container
            * otherwise center bubble is top centered
            */
            centralBubble.scrollTo();
            $('#whole-graph-buttons-container').removeClass(
                "hidden"
            ).affix({
                offset: {top: 50}
            });
            GraphUi.initDragScroll();
            GraphUi.enableDragScroll();
            SelectionHandler.setToSingleVertex(centralBubble);
            GraphDisplayer.getGraphMenuHandler().zoomOut();
            EventBus.publish('/event/ui/graph/drawn');
            // html2canvas(document.body).then(function(canvas) {
            //     document.body.innerHTML = canvas;
            // });
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
                if (isAnonymous) {
                    Header.commonSetupForAnonymous();
                } else {
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
                IdentificationMenu.setup();
                ImageMenu.setup();
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