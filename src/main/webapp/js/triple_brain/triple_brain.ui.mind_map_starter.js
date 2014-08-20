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
        "triple_brain.vertex",
        "triple_brain.top_center_menu",
        "triple_brain.ui.left_panel",
        "triple_brain.selection_handler",
        "triple_brain.keyboard_utils",
        "triple_brain.graph_element_main_menu",
        "triple_brain.vertex_server_facade",
        "triple_brain.mind_map_info",
        "triple_brain.bubble_distance_calculator",
        "triple_brain.freebase",
        "jquery.triple_brain.drag_scroll"
    ],
    function ($, UserService, EventBus, LoginHandler, MindMapTemplate, SearchUi, GraphDisplayer, GraphDisplayerFactory, GraphUi, LanguageManager, VertexService, TopCenterMenu, LeftPanel, SelectionHandler, KeyboardUtils, GraphElementMainMenu, VertexServeFacade, MindMapInfo) {
        "use strict";
        var api = {
            start:function () {
                UserService.isAuthenticated(
                    callBackWhenIsAuthenticated,
                    showCredentialsFlow
                );
                function callBackWhenIsAuthenticated() {
                    handleIfNotAuthenticatedShowCredentialsFlow();
                    handleTopMenuSelectButtons();
                    handleDisconnectButton();
                    handleCreateNewConceptButton();
                    TopCenterMenu.init();
                    LeftPanel.init();
                    SearchUi.init();
                    GraphDisplayer.setImplementation(
                        GraphDisplayerFactory.getByName(
                            "relative_tree"
                        )
                    );
                    UserService.authenticatedUser(function () {
                            handleHistoryBrowse();
                            LanguageManager.loadLocaleContent(function () {
                                GraphDisplayer.displayUsingCentralVertexUri(
                                    MindMapInfo.getCenterVertexUri()
                                );
                                translateText();
                                GraphElementMainMenu.reset();
                            });
                        }
                    );
                }

                function handleHistoryBrowse(){
                    $(window).on("popstate", function() {
                        GraphDisplayer.displayUsingCentralVertexUri(
                            MindMapInfo.getCenterVertexUri()
                        );
                    });
                }

                function translateText() {
                    $("html").i18n();
                }

                function handleIfNotAuthenticatedShowCredentialsFlow() {
                    $("html").ajaxError(function (e, jqxhr) {
                        if (403 === jqxhr.status) {
                            showCredentialsFlow();
                        }
                    });
                }

                function showCredentialsFlow() {
                    $("body").removeClass("hidden");
                    LanguageManager.loadLocaleContent(function () {
                        LoginHandler.startFlow();
                    });
                }

                function handleTopMenuSelectButtons(){
                    $("#select-all-bubbles").click(function(event){
                        event.preventDefault();
                        event.stopPropagation();
                        SelectionHandler.selectAllBubblesOnly();
                    });
                    $("#select-all-relations").click(function(event){
                        event.preventDefault();
                        event.stopPropagation();
                        SelectionHandler.selectAllRelationsOnly();
                    });
                }

                function handleDisconnectButton() {
                    $("#disconnect-btn").click(function () {
                        UserService.logout(function () {
                            window.location = "/";
                        });
                    });
                }

                function handleCreateNewConceptButton() {
                    $("#create-concept").on(
                        "click",
                        function () {
                            VertexService.createVertex(function(newVertex){
                                var serverFormatFacade = VertexServeFacade.fromServerFormat(
                                    newVertex
                                );
                                GraphDisplayer.displayUsingCentralVertexUri(
                                    serverFormatFacade.getUri()
                                );
                            });
                        }
                    );
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
                    function(){
                        if(KeyboardUtils.isCtrlPressed()){
                            return;
                        }
                        SelectionHandler.removeAll();
                    }
                );
                GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
                    EventBus.publish(
                        '/event/ui/vertex/visit_after_graph_drawn',
                        vertex
                    );
                });
                GraphDisplayer.getGroupRelationSelector().visitAll(function(groupRelationUi){
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


