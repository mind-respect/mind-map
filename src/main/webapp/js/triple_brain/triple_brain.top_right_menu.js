/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.selection_handler",
        "triple_brain.user",
        "triple_brain.graph_displayer",
        "triple_brain.vertex_server_facade",
        "triple_brain.vertex_service",
        "triple_brain.mind_map_info",
        "triple_brain.event_bus",
        "triple_brain.schema_service"
    ],
    function ($, SelectionHandler, UserService, GraphDisplayer, VertexServerFacade, VertexService, MindMapInfo, EventBus, SchemaService) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(event, isViewOnly){
            if(isViewOnly){
                getCreateMenu().hide();
            }else{
                handleCreateNewConceptButton();
                handleCreateNewSchemaButton();
                handleDisconnectButton();
            }
            if(MindMapInfo.isAnonymous()){
                getDisconnectButton().hide();
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
            return getLoginRegisterButton().click(function(){
                window.location = "/";
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

        function getCreateSchemaButton(){
            return $("#create-schema");
        }

        function getDisconnectButton(){
            return $("#disconnect-btn");
        }

        function getLoginRegisterButton(){
            return $("#login-register");
        }
    }
);
