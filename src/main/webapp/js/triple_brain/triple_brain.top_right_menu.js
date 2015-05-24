/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.login_handler",
        "triple_brain.selection_handler",
        "triple_brain.user_service",
        "triple_brain.graph_displayer",
        "triple_brain.vertex",
        "triple_brain.vertex_service",
        "triple_brain.mind_map_info",
        "triple_brain.event_bus",
        "triple_brain.schema_service"
    ],
    function ($, LoginHandler, SelectionHandler, UserService, GraphDisplayer, Vertex, VertexService, MindMapInfo, EventBus, SchemaService) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(event, isViewOnly){
            if(isViewOnly){
                getCreateMenu().hide();
            }
            if(MindMapInfo.isAnonymous()){
                getDisconnectButton().addClass("hidden");
                getUserMenu().addClass("hidden")
                handleLoginRegisterButton();
            }else{
                handleCreateNewConceptButton();
                handleCreateNewSchemaButton();
                handleDisconnectButton();
                getLoginRegisterButton().addClass("hidden");
            }
            if(!MindMapInfo.isCenterBubbleUriDefinedInUrl()){
                getSelectButton().addClass("hidden");
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

        function getCreateMenu(){
            return $("#create-menu");
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

        function handleCreateNewSchemaButton() {
            getCreateSchemaButton().off(
                "click",
                createNewSchema
            ).on(
                "click",
                createNewSchema
            );
        }


        function handleLoginRegisterButton(){
            return getLoginRegisterButton().add(
                getLoginRegisterButtonInPage()
            ).click(function(){
                LoginHandler.startFlow();
            });
        }

        function createNewSchema(event){
            event.preventDefault();
            SchemaService.create(
                GraphDisplayer.displayForSchemaWithUri
            );
        }
        function createNewConcept(event){
            event.preventDefault();
            VertexService.createVertex(function (newVertex) {
                var serverFormatFacade = Vertex.fromServerFormat(
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

        function getCreateSchemaButton(){
            return $("#create-schema");
        }

        function getDisconnectButton(){
            return $("#disconnect-btn");
        }

        function getLoginRegisterButton(){
            return $("#login-register");
        }

        function getLoginRegisterButtonInPage(){
            return $("#login-register-in-page");
        }

        function getSelectButton(){
            return $("#select-button");
        }

        function getUserMenu(){
            return $("#user-menu");
        }
    }
);
