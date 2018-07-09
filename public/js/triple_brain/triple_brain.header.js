/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.big_search_box",
        "triple_brain.login_handler",
        "triple_brain.register_handler",
        "triple_brain.selection_handler",
        "triple_brain.user_service",
        "triple_brain.graph_displayer",
        "triple_brain.mind_map_info",
        "triple_brain.event_bus",
        "triple_brain.schema_service",
        "triple_brain.id_uri",
        "triple_brain.language_manager",
        "triple_brain.graph_element_ui",
        "triple_brain.graph_ui",
        "triple_brain.vertex_service",
        "triple_brain.ui_utils"
    ],
    function ($, BigSearchBox, LoginHandler, RegisterHandler, SelectionHandler, UserService, GraphDisplayer, MindMapInfo, EventBus, SchemaService, IdUri, LanguageManager, GraphElementUi, GraphUi, VertexService, UiUtils) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
            setUpShareLinkButton();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
            getSelectButton().removeClass("hidden");
        });

        EventBus.subscribe('/event/ui/graph/drawn /event/ui/graph/vertex/privacy/updated', refreshShareLinkVisibility);

        api.commonSetupForAuthenticated = function () {
            api._commonSetup();
            getMyBubblesSearchInput().removeClass("hidden");
            getMyBubblesSearchInputLabel().removeClass("hidden");
            handleCreateNewConceptButton();
            handleCreateNewSchemaButton();
            handleDisconnectButton();
            getLoginButton().addClass("hidden");
            getRegisterButton().addClass("hidden");
            getAllYourBubblesButton().find(".username").text(UserService.authenticatedUserInCache().user_name);
            handleYourCentralButtons();
            getCreateBubbleButton().removeClass("hidden");
            getCreateSchemaButton().removeClass("hidden");
            if (MindMapInfo.isLandingPageFlow()) {
                getSelectButton().addClass("hidden");
            }
            getYourCentralButtonOnPage().removeClass("hidden").find(".username").text(UserService.authenticatedUserInCache().user_name.toUpperCase());
        };

        api.commonSetupForAnonymous = function () {
            api._commonSetup();
            getCreateBubbleButton().addClass("hidden");
            getCreateSchemaButton().addClass("hidden");
            getLoginButton().removeClass("hidden");
            getRegisterButton().removeClass("hidden");
            getLandingPageSearchInput().removeClass("hidden");
            getLandingPageSearchInputLabel().removeClass("hidden");
            getDisconnectButton().addClass("hidden");
            getUserMenu().addClass("hidden");
            getAllYourBubblesButton().addClass("hidden");
            handleLoginRegisterButtons();
            getYourCentralButtonOnPage().addClass("hidden");
            $("#language-when-anonymous").removeClass("hidden");
            $("#settings-container").addClass("hidden");
        };
        api._commonSetup = function () {
            setupLanguagePicker();
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                BigSearchBox.setup();
            }
            // getSaveAsImageButton().removeClass("hidden");
        };
        return api;

        function refreshShareLinkVisibility() {
            getShareLink()[GraphElementUi.getCenterBubble().getModel().isPublic() ? "removeClass" : "addClass"](
                "hidden"
            );
        }

        function handleTopMenuSelectButtons() {
            $("#select-all-bubbles").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllVerticesOnly();
            });
            $("#select-all-relations").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllRelationsOnly();
            });
        }

        function getSchemaMenu() {
            return $("#schema-menu");
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

        //function handleSaveAsImageButton() {
        //    getSaveAsImageButton().off(
        //        "click",
        //        saveAsImageHandle
        //    ).on(
        //        "click",
        //        saveAsImageHandle
        //    );
        //}

        //function saveAsImageHandle(event){
        //    event.preventDefault();
        //    ExportAsImage.download();
        //}

        function disconnect() {
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
            ).find(
                ".ctrl"
            ).text(
                UiUtils.isMacintosh() ? "⌘" : "ctrl"
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


        function handleLoginRegisterButtons() {
            getLoginButtonOnPage().add(
                getRegisterButtonOnPage()
            ).removeClass("hidden");
            getLoginButton().add(
                getLoginButtonOnPage()
            ).click(function (event) {
                event.preventDefault();
                LoginHandler.showModal();
            });
            getRegisterButton().add(
                getRegisterButtonOnPage()
            ).click(function (event) {
                event.preventDefault();
                RegisterHandler.showModal();
            });
        }

        function handleYourCentralButtons() {
            getAllYourBubblesButton().add(
                getYourCentralButtonOnPage()
            ).removeClass("hidden");
            getAllYourBubblesButton().add(
                getYourCentralButtonOnPage()
            ).prop(
                "href",
                IdUri.allCentralUrlForUsername(
                    UserService.authenticatedUserInCache().user_name
                )
            );
            getYourCentralButtonOnPage().find("button").click(function () {
                window.location = $(this).closest("a").prop("href");
            });
        }

        function createNewSchema(event) {
            event.preventDefault();
            SchemaService.create(function (schemaUri) {
                if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                    window.location = IdUri.htmlUrlForBubbleUri(schemaUri);
                    return;
                }
                GraphDisplayer.displayForSchemaWithUri(schemaUri);
            });
        }

        function createNewConcept(event) {
            event.preventDefault();
            GraphDisplayer.getAppController().createVertex();
        }

        function setUpShareLinkButton() {
            getShareLinkInput().val(
                window.location.href
            );
            getShareLink().click(function (event) {
                event.preventDefault();
                var shareLinkInput = getShareLinkInput();
                shareLinkInput.toggleClass("hidden");
                shareLinkInput[0].setSelectionRange(0, shareLinkInput.val().length);
            });
        }

        function setupLanguagePicker() {
            getLanguagePickerContainer().find(
                "[data-lang=" + LanguageManager.getBrowserLocale() + "]"
            ).addClass("current");
            getLanguagePickerContainer().find("a").click(function (event) {
                event.preventDefault();
                LanguageManager.changeLanguage(
                    $(this).data("lang")
                );
            });
        }

        function getCreateBubbleButton() {
            return $("#create-concept");
        }

        function getCreateSchemaButton() {
            return $("#create-schema");
        }

        function getDisconnectButton() {
            return $("#disconnect-btn");
        }

        function getLoginButton() {
            return $("#login-button");
        }

        function getLoginButtonOnPage() {
            return $("#login-button-on-page");
        }

        function getRegisterButtonOnPage() {
            return $("#register-button-on-page");
        }

        function getYourCentralButtonOnPage() {
            return $("#central-button-on-page");
        }

        function getConnectMenuButton() {
            return $("#connect-menu-button");
        }

        function getRegisterButton() {
            return $("#register-button");
        }

        function getSelectButton() {
            return $("#select-button");
        }

        function getUserMenu() {
            return $("#user-menu");
        }

        function getLandingPageSearchInput() {
            return $("#landing-page-search");
        }

        function getLandingPageSearchInputLabel() {
            return $("label[for=landing-page-search]");
        }

        function getMyBubblesSearchInput() {
            return $("#vertex-search-input");
        }

        function getMyBubblesSearchInputLabel() {
            return $("label[for=vertex-search-input]");
        }

        function getShareLink() {
            return $("#share-link");
        }

        function getShareLinkInput() {
            return $("#share-link-input");
        }

        function getAllYourBubblesButton() {
            return $("#all-your-bubbles-button");
        }

        function getSaveAsImageButton() {
            return $("#save-as-image-button");
        }

        function getLanguagePickerContainer() {
            return $(".language-selector-container");
        }
    }
);
