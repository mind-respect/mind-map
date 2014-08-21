define(
    [
        "jquery",
        "triple_brain.user",
        "triple_brain.event_bus",
        "triple_brain.login_handler",
        "triple_brain.mind-map_template",
        "triple_brain.ui.search",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        "triple_brain.ui.graph",
        "triple_brain.language_manager",
        "triple_brain.top_center_menu",
        "triple_brain.ui.left_panel",
        "triple_brain.selection_handler",
        "triple_brain.keyboard_utils",
        "triple_brain.graph_element_main_menu",
        "triple_brain.mind_map_info",
        "triple_brain.top_right_menu",
        "triple_brain.external_page_loader",
        "triple_brain.bubble_distance_calculator",
        "triple_brain.freebase",
        "jquery.triple_brain.drag_scroll"
    ],
    function ($, UserService, EventBus, LoginHandler, MindMapTemplate, SearchUi, GraphDisplayer, GraphDisplayerFactory, GraphUi, LanguageManager, TopCenterMenu, LeftPanel, SelectionHandler, KeyboardUtils, GraphElementMainMenu, MindMapInfo, TopRightMenu, ExternalPageLoader) {
        "use strict";
        var api = {
            start: function () {
                UserService.isAuthenticated(
                    callBackWhenIsAuthenticated,
                    callBackWhenNotAuthenticated
                );
                function callBackWhenIsAuthenticated() {
                    setupMindMapForAuthenticatedUser();
                }

                function handleHistoryBrowse() {
                    $(window).on("popstate", function () {
                        GraphDisplayer.displayUsingCentralVertexUri(
                            MindMapInfo.getCenterVertexUri()
                        );
                    });
                }

                function translateText() {
                    $("html").i18n();
                }

                function startLoginFlowWhenForbiddenActionIsPerformed() {
                    $("html").ajaxError(function (e, jqxhr) {
                        if (403 === jqxhr.status) {
                            showLoginPage();
                        }
                    });
                }

                function setupMindMapForAuthenticatedUser() {
                    MindMapInfo.setIsAnonymous(false);
                    setupMindMap(false);
                }

                function setupMindMapForAnonymousUser() {
                    MindMapInfo.setIsAnonymous(true);
                    setupMindMap(true);
                }

                function setupMindMap(isAnonymous) {
                    startLoginFlowWhenForbiddenActionIsPerformed();
                    TopRightMenu.earlyInit();
                    TopCenterMenu.init();
                    LeftPanel.init();
                    handleHistoryBrowse();
                    GraphDisplayer.setImplementation(
                        GraphDisplayerFactory.getByName(
                            "relative_tree"
                        )
                    );
                    if (isAnonymous) {
                        loadLocaleAndGraph();
                    }else{
                        UserService.authenticatedUser(loadLocaleAndGraph);
                    }
                    function loadLocaleAndGraph() {
                        LanguageManager.loadLocaleContent(function () {
                            GraphDisplayer.displayUsingCentralVertexUri(
                                MindMapInfo.getCenterVertexUri(),
                                handleGettingGraphError
                            );
                            translateText();
                            GraphElementMainMenu.reset();
                        });
                    }
                }

                function handleGettingGraphError(xhr){
                    $("body").removeClass("hidden");
                    if(xhr.status === 403){
                        ExternalPageLoader.showLinearFlowWithOptions({
                            href:"not-allowed.html",
                            onComplete :function(){

                            },
                            width:450,
                            title:$.t("not_allowed.title")
                        });
                    }
                }

                function callBackWhenNotAuthenticated() {
                    if (MindMapInfo.isCenterVertexUriDefinedInUrl()) {
                        setupMindMapForAnonymousUser();
                    } else {
                        showLoginPage();
                    }
                }

                function showLoginPage() {
                    $("body").removeClass("hidden");
                    LanguageManager.loadLocaleContent(function () {
                        LoginHandler.startFlow();
                    });
                }
            }
        };
        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexUri) {
                SelectionHandler.removeAll();
                var centralVertex = GraphDisplayer.getVertexSelector().withUri(centralVertexUri)[0];
                centralVertex.setAsCentral();
                $("body, html").removeDragScroll().dragScroll().on(
                    "click",
                    function () {
                        if (KeyboardUtils.isCtrlPressed()) {
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
                EventBus.publish('/event/ui/graph/drawn');
            }
        );
        return api;
    }
);


