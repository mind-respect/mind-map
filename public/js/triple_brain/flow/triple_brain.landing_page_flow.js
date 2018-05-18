/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.language_manager",
    "triple_brain.mind_map_info",
    "triple_brain.graph_displayer",
    "triple_brain.graph_displayer_factory",
    "triple_brain.graph_element_main_menu",
    "triple_brain.flow",
    "triple_brain.id_uri",
    "triple_brain.user_service",
    "triple_brain.login_handler",
    "triple_brain.register_handler",
    "mr.forgot-password-flow",
    "ekko-lightbox"
], function ($, LanguageManager, MindMapInfo, GraphDisplayer, GraphDisplayerFactory, GraphElementMainMenu, Flow, IdUri, UserService, LoginHandler, RegisterHandler, ForgotPasswordFlow) {
    "use strict";
    var api = {};
    api.enterForAuthenticated = function () {
        MindMapInfo.setIsAuthenticatedLandingPageFlow(true);
        GraphElementMainMenu.reset();
        api.enter();
    };
    api.enter = function () {
        if(MindMapInfo.isAuthenticatedLandingPageFlow() && window.location.href.indexOf("?") === -1){
            window.location.href = IdUri.allCentralUrlForUsername(
                UserService.authenticatedUserInCache().user_name
            );
            return;
        }
        LanguageManager.loadLocaleContent(function () {
            $("html").i18n();
            Flow.showOnlyFlow("landing");
            $("body").removeClass("hidden");
        });
        setUpFeatures();
        $(".frontier").remove();
        Flow.publishFlow("landing");
        enterSubFlow(mrSubFlow);
    };
    window.onpopstate = function(event) {
        $('.modal').modal('hide');
        enterSubFlow(event.state);
    };
    return api;

    function setUpFeatures() {
        $(".carousel-inner .item img[data-remote]").click(function () {
            modalResource($(this));
        });
        $(".play-button").click(function () {
            $(this).siblings("img").click();
        });
        $(document).on("slide.bs.carousel", function (event) {
            var $item = $(event.relatedTarget);
            var controls = $item.closest(".action").find("[data-slide-to]");
            controls.removeClass("active");
            controls.filter(
                "[data-slide-to=" + $item.index() + "]"
            ).addClass(
                "active"
            );
        });
        $(".action .descriptions li").click(function () {
            var $this = $(this);
            var carouselSelector = $this.data("target");
            var image = $(carouselSelector).find(".item:eq(" + $this.data("slideTo") + ")").find("img");
            modalResource(image);
        });
    }

    function modalResource(image) {
        image.ekkoLightbox({});
    }
    function enterSubFlow(subFlow){
        if(subFlow === "login"){
            return LoginHandler.showModal();
        }
        if(subFlow === "register"){
            return RegisterHandler.showModal();
        }
        if(subFlow === "forgot-password"){
            return ForgotPasswordFlow.enter();
        }
    }
});
