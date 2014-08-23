/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.selection_handler",
        "triple_brain.user",
        "triple_brain.graph_displayer",
        "triple_brain.vertex_server_facade",
        "triple_brain.vertex",
        "triple_brain.mind_map_info",
        "triple_brain.event_bus"
    ],
    function ($, SelectionHandler, UserService, GraphDisplayer, VertexServerFacade, VertexService, MindMapInfo, EventBus) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(event, isViewOnly){
            if(isViewOnly){
                getCreateBubbleButton().css("visibility", "hidden");
            }else{
                handleCreateNewConceptButton();
                handleDisconnectButton();
            }
            if(MindMapInfo.isAnonymous()){
                getDisconnectButton().css("visibility", "hidden");
                handleLoginRegisterButton();
            }else{
                getLoginRegisterButton().hide();
            }
        });
        return api;
        function handleTopMenuSelectButtons() {
            $("#select-all-bubbles").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllBubblesOnly();
            });
            $("#select-all-relations").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllRelationsOnly();
            });
        }

        function handleDisconnectButton() {
            getDisconnectButton().off(
                "click",
                disconnect
            ).on(
                "click",
                disconnect
            );
        }

        function disconnect(){
            UserService.logout(function () {
                window.location = "/";
            });
        }

        function handleCreateNewConceptButton() {
            getCreateBubbleButton().off(
                "click",
                createNewConcept
            ).on(
                "click",
                createNewConcept
            );
        }

        function handleLoginRegisterButton(){
            return getLoginRegisterButton().click(function(){
                window.location = "/";
            });
        }

        function createNewConcept(){
            VertexService.createVertex(function (newVertex) {
                var serverFormatFacade = VertexServerFacade.fromServerFormat(
                    newVertex
                );
                GraphDisplayer.displayUsingCentralVertexUri(
                    serverFormatFacade.getUri()
                );
            });
        }

        function getCreateBubbleButton(){
            return $("#create-concept");
        }

        function getDisconnectButton(){
            return $("#disconnect-btn");
        }

        function getLoginRegisterButton(){
            return $("#login-register");
        }
    }
);
