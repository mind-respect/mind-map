/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [
        "jquery",
        "triple_brain.user_service",
        "triple_brain.bubble_distance_calculator",
        "triple_brain.event_bus",
        "triple_brain.ui.search",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        "triple_brain.ui.graph",
        "triple_brain.language_manager",
        "triple_brain.top_center_menu",
        "triple_brain.ui.left_panel",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_main_menu",
        "triple_brain.mind_map_info",
        "triple_brain.top_right_menu",
        "triple_brain.external_page_loader",
        "triple_brain.id_uri",
        "triple_brain.anonymous_flow",
        "triple_brain.change_password",
        "triple_brain.login_handler",
        "triple_brain.wikidata",
        "jquery.triple_brain.drag_scroll",
        "triple_brain.bottom_center_panel",
        "triple_brain.modules"
    ],
    function ($, UserService, BubbleDistanceCalculator, EventBus, SearchUi, GraphDisplayer, GraphDisplayerFactory, GraphUi, LanguageManager, TopCenterMenu, LeftPanel, SelectionHandler, GraphElementMainMenu, MindMapInfo, TopRightMenu, ExternalPageLoader, IdUriUtils, AnonymousFlow, ChangePassword, LoginHandler) {
        "use strict";
        var api = {
            start: function () {
                UserService.isAuthenticated(
                    setupMindMapForAuthenticatedUser,
                    callBackWhenNotAuthenticated
                );

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

                function startLoginFlowWhenForbiddenActionIsPerformed() {
                    $("html").ajaxError(function (e, jqxhr) {
                        if (403 === jqxhr.status) {
                            LoginHandler.showModal();
                        }
                    });
                }

                function setupMindMapForAuthenticatedUser() {
                    if(!MindMapInfo.isCenterBubbleUriDefinedInUrl()){
                        UserService.authenticatedUser(function(user){
                            UserService.getDefaultVertexUri(
                                user.user_name,
                                function (uri) {
                                    window.location = "?bubble=" + uri
                                }
                            );
                        });
                        return;
                    }
                    MindMapInfo.setIsAnonymous(false);
                    setupMindMap(false);
                }

                function setupMindMapForAnonymousUser() {
                    MindMapInfo.setIsAnonymous(true);
                    setupMindMap(true);
                }

                function setupMindMap(isAnonymous) {
                    BubbleDistanceCalculator.activate();
                    startLoginFlowWhenForbiddenActionIsPerformed();
                    $("#app-presentation").addClass("hidden");
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
                    } else {
                        UserService.authenticatedUser(loadLocaleAndGraph);
                    }
                    function loadLocaleAndGraph() {
                        LanguageManager.loadLocaleContent(function () {
                            GraphDisplayer.displayForBubbleWithUri(
                                MindMapInfo.getCenterBubbleUri(),
                                handleGettingGraphError
                            );
                            translateText();
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

                function callBackWhenNotAuthenticated() {
                    LoginHandler.setupModal();
                    LoginHandler.setupWelcomePageAuth();
                    if(ChangePassword.isChangePasswordFlow()){
                        ChangePassword.enterFlow();
                    }
                    if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                        setupMindMapForAnonymousUser();
                    } else {
                        AnonymousFlow.enter();
                    }
                }
            }
        };
        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, centralVertexUri) {
                SelectionHandler.removeAll();
                var centralVertex = IdUriUtils.isSchemaUri(centralVertexUri) ?
                    GraphDisplayer.getSchemaSelector().get() :
                    GraphDisplayer.getVertexSelector().withUri(centralVertexUri)[0];
                centralVertex.setAsCentral();
                $("#drawn_graph").removeDragScroll().dragScroll().on(
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
    }
);
