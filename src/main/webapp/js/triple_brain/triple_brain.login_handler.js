/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.config",
    "triple_brain.registration_handler",
    "triple_brain.overlay_dialog",
    "jquery",
    "jquery.json.min"
],
    function (Config, RegistrationHandler, OverlayDialog, $) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            OverlayDialog.showLinearFlowWithOptions({
                href:"login-form.html",
                onComplete:function(){
                    handleLoginForm();
                    handleRegisterLink();
                }
            })
        }
        return api;
        function handleLoginForm() {
            $(access.loginButton()).click(function (e) {
                var loginInfo = {
                    email:$(access.emailField()).val(),
                    password:$(access.passwordField()).val()
                };
                $.ajax({
                    type:'POST',
                    data:$.toJSON(loginInfo),
                    url:Config.links.app + '/service/users/authenticate',
                    dataType:'json',
                    contentType:'application/json;charset=utf-8'
                }).success(
                    function () {
                        window.location = "/";
                    }).error(function () {
                        $(access.errorMessage()).show();
                        OverlayDialog.adjustSize();
                    });
            });
            $(access.errorMessage()).hide();
            access.loginForm().reset();
        }


        function defineAccess() {
            var access = {};
            access.errorMessage = function () {
                return $('#login-error');
            }
            access.loginButton = function () {
                return $('#login-button');
            }
            access.emailField = function () {
                return $("#login-email");
            }
            access.passwordField = function () {
                return $("#login-password");
            }
            access.loginForm = function () {
                return $('#login-form')[0];
            }
            access.registerLink = function(){
                return $("#register-link");
            }
            return access;
        }
        function handleRegisterLink(){
            $(access.registerLink()).on("click", function(){
                RegistrationHandler.startFlow();
            });
        }
    }
)