/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "mr.centers-flow",
    "mr.friends-flow",
    "triple_brain.user_service",
    "triple_brain.graph_ui",
    "triple_brain.language_manager",
    "mr.friend-service"
], function ($, IdUri, CentersFlow, FriendsFlow, UserService, GraphUi, LanguageManager, FriendService) {
    "use strict";
    var api = {};
    api.enter = function () {
        $("body").removeClass("no-scroll");
        LanguageManager.loadLocaleContent(function () {
            $("html").i18n();
            $("body").removeClass("hidden");
        });
        var $yourBubblesTab = $("#your-bubbles-tab");
        $yourBubblesTab.click(function (event) {
            event.preventDefault();
            enterSubFlow("centerBubbles");
        });
        $("#friends-tab").click(function (event) {
            event.preventDefault();
            enterSubFlow("friends");
        });
        $yourBubblesTab.find("a .username").text(
            IdUri.currentUsernameInUrl().toUpperCase()
        );
        setupFriendFlow().then(function () {
            return enterSubFlow(mrSubFlow);
        }).then(function () {
            GraphUi.getDrawnGraph().addClass("hidden");
            $("body").removeClass("hidden");
            getSectionContainer().removeClass("hidden");
        });
    };

    window.onpopstate = function (event) {
        enterSubFlow(event.state);
    };

    return api;

    function getSectionContainer() {
        return $("#connected-home-flow");
    }

    function enterSubFlow(subFlow) {
        getSectionContainer().find("ul.nav-tabs li").removeClass("active");
        getSectionContainer().find(".subflow").addClass("hidden");
        var baseUrl = "/user/" + usernameForBublGuru;
        if ("friends" === subFlow) {
            $("#friends-subflow").removeClass("hidden");
            $("#friends-tab").addClass("active");
            if (history.state !== 'friends' && window.location.href.indexOf('friends') === -1) {
                history.pushState('friends', null, baseUrl + '/friends');
            }
            return FriendsFlow.enter(isOwner());
        } else if ("centerBubbles" === subFlow) {
            $("#your-bubbles-tab").addClass("active");
            if (history.state !== 'centerBubbles' && window.location.href.indexOf('friends') !== -1) {
                history.pushState('centerBubbles', null, baseUrl);
            }
            return CentersFlow.enter(isOwner());
        }
    }

    function isOwner() {
        return UserService.hasCurrentUser() && usernameForBublGuru === UserService.authenticatedUserInCache().user_name;
    }

    function setupFriendFlow() {
        var promise = $.Deferred().resolve();
        var url = new URL(window.location.href);
        if (!isOwner() && url.searchParams.get("confirm-token")) {
            promise = FriendService.confirmFriendshipUsingUrlToken(
                url
            ).then(function (newlyConnectedUser) {
                if(!newlyConnectedUser){
                    window.location.href = url.href.replace(url.search, "") + "?flow=confirmFriendError";
                    return $.Deferred().reject();
                }
                if (!UserService.hasCurrentUser()) {
                    window.location.href = url.href.replace(url.search, "") + "?flow=newConfirmFriend";
                    return $.Deferred().reject();
                }
            });
        }
        if (isOwner() || !UserService.hasCurrentUser()) {
            return promise;
        }
        return promise.then(function () {
            return FriendService.getStatusWithUser(usernameForBublGuru).then(function (response) {
                var $waitingFriendship = $(".waiting-friendship");
                var $confirmedFriendship = $(".confirmed-friendship");
                switch (response.status) {
                    case "none": {
                        var $addFriendBtn = $(".add-friend-btn");
                        $addFriendBtn.removeClass("hidden");
                        return $addFriendBtn.click(function () {
                            $addFriendBtn.attr("disabled", "disabled");
                            FriendService.addFriend(
                                IdUri.currentUsernameInUrl()
                            ).then(function () {
                                $addFriendBtn.addClass("hidden");
                                $waitingFriendship.removeClass("hidden");
                            });
                        });
                    }
                    case "waiting": {
                        return $waitingFriendship.removeClass("hidden");
                    }
                    case "waitingForYourAnswer": {
                        var $confirmFriendshipBtn = $(".confirm-friendship-btn").removeClass("hidden");
                        return $confirmFriendshipBtn.click(function () {
                            $confirmFriendshipBtn.attr("disabled", "disabled");
                            FriendService.addFriend(
                                IdUri.currentUsernameInUrl()
                            ).then(function () {
                                $confirmFriendshipBtn.addClass("hidden");
                                $confirmedFriendship.removeClass("hidden");
                            });
                        });
                    }
                    case "confirmed": {
                        return $confirmedFriendship.removeClass("hidden");
                    }
                }
            });
        });
    }
});
