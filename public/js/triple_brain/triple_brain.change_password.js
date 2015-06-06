/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "jquery.url",
    "bootstrap"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.enterFlow = function(){
        getChangePasswordPage().removeClass("hidden");
        getSubmitButton().click(function(){
            hideAllMessages();
            if(!doPasswordsMatch()){
                $("#change-password-dont-match").removeClass("hidden");
                return;
            }
            UserService.changePassword(
                getPasswordInput().val().trim(),
                getEmail(),
                getToken(),
                changePasswordSuccess,
                changePasswordError
            )
        });
    };
    api.isChangePasswordFlow = function(){
        return $.url().param("reset-token") !== undefined;
    };
    return api;

    function changePasswordSuccess(){
        hideAllMessages();
        $("#change-password-success").removeClass("hidden");
    }

    function changePasswordError(xhr){
        hideAllMessages();
        var badRequestCode = 400;
        if(badRequestCode === xhr.status){
            $("#change-password-too-short").removeClass("hidden");
            return;
        }
        $("#change-password-wrong").removeClass("hidden");
    }

    function hideAllMessages(){
        getMessages().addClass("hidden");
    }

    function getMessages(){
        return getChangePasswordPage().find(".alert");
    }

    function doPasswordsMatch(){
        return getPasswordInput().val().trim() === getPasswordRepeatInput().val().trim();
    }

    function getPasswordInput(){
        return $("#change-password-input");
    }
    function getPasswordRepeatInput(){
        return $("#change-password-repeat-input");
    }
    function getChangePasswordPage(){
        return $("#change-password-page");
    }
    function getSubmitButton(){
        return $("#forgot-password-submit");
    }
    function getToken(){
        return $.url().param("reset-token");
    }
    function getEmail(){
        return $.url().param("email");
    }
});