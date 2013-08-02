/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.external_page_loader",
    "triple_brain.user",
    "triple_brain.language_manager"
],
    function (Require, $, ExternalPageLoader, UserService, LanguageManager) {
        var api = {};
        var access = defineAccess();
        api.startFlow = function () {
            ExternalPageLoader.showLinearFlowWithOptions({
                href:"register-form.html",
                onComplete:function () {
                    handleRegisterForm();
                    handleLoginLink();
                },
                width:450,
                title:$.t("register.title")
            });
        };
        return api;
        function handleRegisterForm() {
            setupLanguageMenu();
            access.errorMessages().hide();
            access.registerForm().reset();
            access.registerButton().on("click", function () {
                UserService.register(
                    formAsJSon(),
                    handleRegistrationSuccess,
                    handleRegistrationError
                );
            });
            access.registerPage().i18n();
        }

        function handleLoginLink() {
            access.loginLink().on("click", function (event) {
                event.preventDefault();
                var LoginHandler = require("triple_brain.login_handler");
                LoginHandler.startFlow();
            });
        }

        function setupLanguageMenu() {
            handleAddLanguageButton();
            setupSelectedLanguagesList();
            function setupSelectedLanguagesList() {
                var currentLocale = LanguageManager.getLocale();
                var selectedLanguagesList = access.getSelectedLanguagesList();
                selectedLanguagesList.append(
                    makeListElementForSelectedLanguages(
                        getLanguageOfLocale(
                            LanguageManager.getLocale()
                        )
                    )
                );
                selectedLanguagesList.sortable().disableSelection();
            }

            function handleAddLanguageButton(){
                access.getAddLanguagesButton().on("click", function(event){
                    event.preventDefault();
                    setupAvailableLanguagesMenu();
                });
                function setupAvailableLanguagesMenu() {
                    var menu = $('<div>');
                    var filterLanguagesInput = $(
                        "<input type='text' placeholder='"+
                            $.t("register.language.filter")
                        +"'>");
                    menu.append(filterLanguagesInput);
                    filterLanguagesInput.on(
                        "keyup",
                        function(){
                            var filterInput = $(this);
                            var list = filterInput.siblings(
                                ".registration-available-languages"
                            );
                            list.find("> li").hide()
                                .filter(function(){
                                    var listElement = $(this);
                                    return listElement.text().toLowerCase().indexOf(
                                        filterInput.val().toLowerCase()
                                    ) !== -1;
                                }).show()
                            return false;
                    });
                    var availableLanguagesList = $(
                        "<ul class='registration-available-languages'>"
                    );
                    var languagesWithoutSelectedLanguages = filterLanguages(
                        LanguageManager.getPossibleLanguages(),
                        getSelectedLanguages()
                    );
                    $.each(languagesWithoutSelectedLanguages, function () {
                        availableLanguagesList.append(
                            makeListElementForAvailableLanguages(this)
                        );
                    });
                    menu.append(availableLanguagesList);
                    menu.dialog({
                        title:$.t("register.language.available_languages")
                    });
                    function makeListElementForAvailableLanguages(language){
                        var listElement = makeListElementUsingLanguage(language);
                        var addButton = $(
                            "<button class='add-button-in-list'>"
                        );
                        addButton.append(
                            "+"
                        );
                        addButton.on(
                            "click",
                            function(){
                                var selectedListElement = $(this).closest(
                                    "li"
                                );
                                var language = selectedListElement.data(
                                    "language"
                                );
                                selectedListElement.remove();
                                access.getSelectedLanguagesList().append(
                                    makeListElementForSelectedLanguages(
                                        language
                                    )
                                );
                            }
                        );
                        listElement.prepend(
                            addButton
                        );
                        return listElement;
                    }
                }
            }

            function makeListElementForSelectedLanguages(language){
                var listElement = makeListElementUsingLanguage(language);
                var moveInstruction = $(
                    "<span class='ui-icon ui-icon-arrowthick-2-n-s'>"
                );
                listElement.prepend(moveInstruction);
                var removeButton = $(
                    "<button class='remove-button-in-list'>"
                ).append("x");
                removeButton.on("click", function(){
                    $(this).closest("li").remove();
                });
                listElement.append(
                    removeButton
                );
                return listElement;
            }

            function makeListElementUsingLanguage(language) {
                var label = $("<label>");
                label.append(
                    language.fullname
                );
                return $("<li>")
                    .append(
                    label
                )
                    .data(
                    "language",
                    language
                )
                    .addClass(
                    "ui-state-default"
                );
            }

            function filterLanguages(languages, languagesToRemove) {
                var filteredLanguages = [];
                $.each(languages, function () {
                    var language = this;
                    if(!languagesToRemoveContainLanguage(language)){
                        filteredLanguages.push(
                            language
                        );
                    }
                });
                return filteredLanguages;
                function languagesToRemoveContainLanguage(language){
                    var containsLanguage = false;
                    $.each(languagesToRemove, function(){
                        var languageToRemove = this;
                        if (language.locale === languageToRemove.locale) {
                            containsLanguage = true;
                            return -1;
                        }
                    });
                    return containsLanguage;
                }
            }
        }

        function getLanguageOfLocale(locale){
            var language = LanguageManager.englishLanguage();
            $.each(LanguageManager.getPossibleLanguages(), function(){
                if(this.locale === locale){
                    language = this;
                    return -1;
                }
            });
            return language;
        }

        function formAsJSon() {
            var formAsJson = {};
            formAsJson.user_name = access.userNameField().val();
            formAsJson.email = access.emailField().val();
            formAsJson.password = access.passwordField().val();
            formAsJson.password_verification = access.passwordConfirmationField().val();
            formAsJson.preferred_locales = getListOfSelectedLocales();
            return formAsJson;
            function getListOfSelectedLocales(){
                var list = [];
                $.each(access.getSelectedLanguagesList().find("> li"), function(){
                    list.push(
                        $(this).data("language").locale
                    );
                });
                return list;
            }
        }

        function handleRegistrationSuccess() {
            window.location.reload();
        }

        function handleRegistrationError(errors) {
            access.errorMessages().hide();
            for (var i in errors) {
                $('#' + errors[i].reason).show();
            }
        }

        function getSelectedLanguages(){
            var selectedLanguages = [];
            $.each(access.getSelectedLanguagesList().find("> li"), function(){
                var lisElement = $(this);
                selectedLanguages.push(
                    lisElement.data("language")
                );
            });
            return selectedLanguages;
        }

        function defineAccess() {
            return {
                registerPage:function () {
                    return $("#registration-page");
                },
                errorMessages:function () {
                    return $('.alert-error');
                },
                registerButton:function () {
                    return $('#register-button');
                },
                userNameField:function () {
                    return $("#register-user_name");
                },
                emailField:function () {
                    return $("#register-email");
                },
                passwordField:function () {
                    return $("#register-password");
                },
                passwordConfirmationField:function () {
                    return $("#register-retype_password");
                },
                registerForm:function () {
                    return $('#register-form')[0];
                },
                loginLink:function () {
                    return $("#login-link");
                },
                getSelectedLanguagesList:function () {
                    return $("#selectedLanguages");
                },
                getAddLanguagesButton:function(){
                    return $("#more-languages-link");
                }
            };
        }
    }
)