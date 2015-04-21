/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.bubble_factory"
], function ($, EventBus, BubbleFactory) {
    "use strict";
    var enterKeyCode = 13,
        api = {},
        goToSameBubbleText;
    api.setUpLabel = function (label) {
        label.blur(function () {
            nonEditMode($(this));
        }).keydown(function (event) {
            if (enterKeyCode === event.which) {
                var hasSelectedFromAutocomplete = $("ul.ui-autocomplete:visible").find(".ui-state-focus").length > 0;
                if (!hasSelectedFromAutocomplete){
                    event.preventDefault();
                    $(this).blur();
                }
            }
        });
    };
    api.addDuplicateElementButtonIfApplicable = function(element){
        var otherInstances = element.getOtherInstances();
        if (otherInstances.length === 0) {
            return;
        }
        addDuplicateButton(element);
        $.each(otherInstances, function () {
            var otherInstance = this;
            otherInstance.resetOtherInstances();
            if (!otherInstance.hasTheDuplicateButton()) {
                addDuplicateButton(otherInstance);
            }
        });
        function addDuplicateButton(element) {
            element.getInBubbleContainer().prepend(
                buildDuplicateButton()
            );
        }

        function buildDuplicateButton() {
            var button = $(
                "<button class='duplicate graph-element-button round-button' data-toggle='tooltip' data-placement='top'>"
            ).prop(
                "title",
                goToSameBubbleText
            ).append(
                $("<i class='fa fa-link'>")
            ).on(
                "click",
                function (event) {
                    event.stopPropagation();
                    var bubble = BubbleFactory.fromSubHtml($(this));
                    $(
                        bubble.getOtherInstances()[0].getHtml()
                    ).centerOnScreenWithAnimation();
                }
            );
            return $("<div class='duplicate-button-container'>").append(
                button
            ).tooltip();
        }
    };

    EventBus.subscribe(
        'localized-text-loaded',
        function(){
            goToSameBubbleText = $.t("vertex.same_bubble");
        }
    );

    return api;

    function nonEditMode(label) {
        label.attr(
            "contenteditable",
            "false"
        );
        label.closest(".graph-element").removeClass("edit");
    }

});