/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.language_manager",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus",
    //"bootstrap-modal-carousel",
    "ekko-lightbox"
], function ($, LanguageManager, MindMapInfo) {
    "use strict";
    var api = {};
    api.enter = function(){
        LanguageManager.loadLocaleContent(function(){
            $("html").i18n();
            getWelcomeContent().removeClass("hidden");
            $("body").removeClass("hidden");

        });
        MindMapInfo.setIsAnonymous(true);
        MindMapInfo.defineIsViewOnlyIfItsUndefined();
        setUpFeatures();
        $(".frontier").remove();
    };
    return api;
    function getWelcomeContent(){
        return $("#welcome-content");
    }

    function setUpFeatures(){
        $(".carousel-inner .item img[data-remote]").click(function(){
            modalResource($(this));
        });
        $(".play-button").click(function(){
            $(this).siblings("img").click();
        });
        $(document).on("slide.bs.carousel", function(event){
            var $item = $(event.relatedTarget);
            var controls = $item.closest(".action").find("[data-slide-to]");
            controls.removeClass("active");
            controls.filter(
                "[data-slide-to="+$item.index()+"]"
            ).addClass(
                "active"
            );
        });
        $(".action .descriptions li").click(function(){
            var $this = $(this);
            var carouselSelector = $this.data("target");
            var image = $(carouselSelector).find(".item:eq(" + $this.data("slideTo") +")").find("img");
            modalResource(image);
        });
    }
    function getBigImageModal(){
        return $("#bigImageModal");
    }

    function modalResource(image){
        image.ekkoLightbox({});
        //var bigImageModal = getBigImageModal();
        //bigImageModal.find("img").prop(
        //    "src",
        //    image.attr("data-big-src")
        //);
        //bigImageModal.modal();
    }
});