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
    "triple_brain.ui.graph",
    "ekko-lightbox"
], function ($, LanguageManager, MindMapInfo, GraphDisplayer, GraphDisplayerFactory, GraphElementMainMenu, GraphUi) {
    "use strict";
    var api = {};
    api.enterForAuthenticated = function () {
        MindMapInfo.setIsAuthenticatedLandingPageFlow(true);
        GraphDisplayer.setImplementation(
            GraphDisplayerFactory.getByName(
                "relative_tree"
            )
        );
        GraphElementMainMenu.reset();
        api.enterForAuthenticatedOrNot(true);
    };
    api.enter = function () {
        api.enterForAuthenticatedOrNot(false);
    };
    api.enterForAuthenticatedOrNot = function (isAuthenticated) {
        GraphUi.getDrawnGraph().addClass("hidden");
        LanguageManager.loadLocaleContent(function () {
            $("html").i18n();
            getWelcomeContent().removeClass("hidden");
            $("body").removeClass("hidden");
        });
        MindMapInfo.setIsAnonymous(!isAuthenticated);
        MindMapInfo.defineIsViewOnlyIfItsUndefined();
        setUpFeatures();
        $(".frontier").remove();
    };
    return api;
    function getWelcomeContent() {
        return $("#welcome-content");
    }

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
});