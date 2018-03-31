/*
 * Copyright Vincent Blouin under the GPL License version 3
 * forked from https://github.com/sebhildebrandt/reveal.js-tagcloud-plugin
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "mr.ask_modal",
    "triple_brain.center_graph_element_service",
    "triple_brain.event_bus",
    "mr.app_controller",
    "triple_brain.user_service",
    "triple_brain.graph_element_type",
    "moment",
    "bootstrap-table",
    "jquery.i18next"

], function ($, IdUri, AskModal, CenterGraphElementService, EventBus, AppController, UserService, GraphElementType, Moment) {
    "use strict";
    var _elements,
        _container,
        tableData = [],
        checkedCenters = [],
        table = $('#word-cloud-table');
    return {
        buildFromElementsInContainer: function (elements, container) {
            _elements = elements;
            _container = container;
            buildHtml();
            setTitle();
            handleRemoveCenterBtnClick();
            handleCreateNewConceptButton();
            hideElementsForOwnerOnlyIfApplicable();
            setupTypeFilters();
            EventBus.subscribe("localized-text-loaded", function () {
                $(".fixed-table-toolbar .search input").attr(
                    "data-i18n",
                    "[placeholder]centralBubbles.filter"
                );
                _container.find("th.bubble-label .th-inner").attr(
                    "data-i18n",
                    "centralBubbles.center"
                );
                _container.find("th.context .th-inner").attr(
                    "data-i18n",
                    "centralBubbles.context"
                );
                _container.find("th.last-visit .th-inner").attr(
                    "data-i18n",
                    "centralBubbles.lastVisit"
                );
                _container.i18n();
            });
        }
    };

    function buildHtml() {
        _elements.forEach(function (element) {
            tableData.push({
                uri: element.getUri(),
                centerElement: element,
                bubbleLabel: getLabelCellContentForElement(element),
                bubbleLabelValue: element.getLabel(),
                graphElementType: IdUri.getGraphElementTypeFromUri(element.getUri()),
                context: getContextCellContentForElement(element),
                lastVisit: getLastVisitCellContentForElement(element),
                lastVisitValue: element.getLastCenterDate().getTime()
            });
        });
        table.bootstrapTable({
            search: true,
            header: "#word-cloud-header",
            sortName: "lastVisit",
            sortOrder: "desc",
            searchAlign: 'left',
            onPostHeader: function () {
                $(".fixed-table-toolbar .search input").attr(
                    "placeholder",
                    $.t("centralBubbles.filter")
                );
                _container.find("input[type=checkbox]").addClass("form-control");
            },
            onCheckAll: function (rows) {
                checkedCenters = [];
                rows.forEach(function (row) {
                    checkedCenters.push(
                        row.centerElement
                    );
                });
            },
            onUncheckAll: function () {
                checkedCenters = [];
            },
            onCheck: function (row) {
                checkedCenters.push(
                    row.centerElement
                );
            },
            onUncheck: function (row) {
                var index = 0;
                checkedCenters.forEach(function (centerElement) {
                    if (centerElement.getUri() === row.centerElement.getUri()) {
                        checkedCenters.splice(index, 1);
                    }
                    index++;
                });
            },
            columns: [{
                field: "bubbleLabelValue",
                searchable: true,
                'class': 'hidden'
            }, {
                field: 'bubbleLabel',
                title: $.t("centralBubbles.center"),
                'class': 'bubble-label',
                searchable: false
            }, {
                field: 'context',
                title: $.t("centralBubbles.context"),
                'class': 'context hidden-xs',
                searchable: false
            }, {
                field: 'lastVisit',
                title: $.t("centralBubbles.lastVisit"),
                sortable: true,
                'class': 'last-visit hidden-sm hidden-xs',
                sortName: "lastVisitValue",
                searchable: false
            }, {
                field: "select",
                checkbox: true,
                "class": "form-group select-checkbox",
                searchable: false
            }],
            data: tableData
        });
    }

    function getLabelCellContentForElement(element) {
        var label = element.getLabel().trim();
        var anchor = buildAnchorForElement(element);
        if (!label) {
            anchor.addClass("empty");
            label = "empty label";
        }
        anchor.text(
            label
        );
        anchor.prepend(
            $("<i class='fa'>").addClass(
                getIconClassFromElementUri(element.getUri())
            ),
            " "
        );
        return anchor.prop('outerHTML');
    }

    function getIconClassFromElementUri(elementUri) {
        switch (IdUri.getGraphElementTypeFromUri(elementUri)) {
            case GraphElementType.Relation :
                return "fa-arrows-h";
            case GraphElementType.Meta :
                return "fa-tag";
            default :
                return "fa-circle-o";
        }
    }

    function getContextCellContentForElement(element) {
        var anchor = buildAnchorForElement(element);
        var container = $("<div class='grid'>").appendTo(
            anchor
        );
        var contextUris = Object.keys(element.getContext());
        if (contextUris.length < 1) {
            anchor.addClass("empty").text(
                "empty label"
            );
        }
        for (var i = 0; i < contextUris.length; i++) {
            var text = element.getContext()[contextUris[i]];
            container.append(
                $("<div class='grid-item'>").text(
                    text
                )
            );
        }
        return anchor.prop('outerHTML');
    }

    function getLastVisitCellContentForElement(element) {
        return buildAnchorForElement(element).addClass(
            "text-right"
        ).text(
            new Moment(element.getLastCenterDate()).fromNow()
        ).prop('outerHTML');
    }

    function buildAnchorForElement(element) {
        return $("<a>").prop(
            "href",
            IdUri.htmlUrlForBubbleUri(
                element.getUri()
            )
        ).attr(
            "title",
            element.getLabel()
        );
    }

    function setTitle() {
        document.title = IdUri.currentUsernameInUrl() + " | MindRespect";
        _container.siblings("h2").text(
            IdUri.currentUsernameInUrl()
        );
    }

    function hideElementsForOwnerOnlyIfApplicable() {
        if (IdUri.currentUsernameInUrl() === UserService.authenticatedUserInCache().user_name) {
            $(".owner-only").removeClass("hidden");
        }
    }


    function handleRemoveCenterBtnClick() {
        $("#remove-center-btn").off(
            "click",
            removeCenterBtnClick
        ).on(
            "click",
            removeCenterBtnClick
        );
    }

    function handleCreateNewConceptButton() {
        $("#create-bubble-btn").off(
            "click",
            createNewConcept
        ).on(
            "click",
            createNewConcept
        );
    }

    function createNewConcept(event) {
        event.preventDefault();
        AppController.createVertex();
    }

    function removeCenterBtnClick() {
        if (!checkedCenters.length) {
            return;
        }
        var centersUri = checkedCenters.map(function (center) {
            return center.getUri();
        });
        askToRemoveCenters().then(function () {
            table.bootstrapTable('remove', {field: 'uri', values: centersUri});
            checkedCenters = [];
            return CenterGraphElementService.removeCentersWithUri(
                centersUri
            );
        });
    }

    function askToRemoveCenters() {
        displayCentersLabelToRemove();
        var modal = $("#remove-centers-confirm-menu").modal();
        var hasMultipleCheckedElements = checkedCenters.length > 1;
        var askModal = AskModal.usingModalHtml(modal, hasMultipleCheckedElements);
        return askModal.ask();
    }

    function displayCentersLabelToRemove() {
        var ul = $("#remove-centers-list").empty();
        checkedCenters.forEach(function (centerElement) {
            ul.append(
                $("<li>").text(
                    centerElement.getLabel()
                )
            );
        }.bind(this));
    }

    function setupTypeFilters() {
        setupAddAll();
        setupRemoveAll();
        getFilterByTypeInputs().click(reviewTypeFilters);
        reviewTypeFilters();
    }

    function reviewTypeFilters() {
        var typesToFilter = [];
        $.each(getFilterByTypeInputs(), function () {
            var input = $(this);
            if (input.prop("checked")) {
                typesToFilter.push(
                    input.data("filterName")
                );
            }
        });
        table.bootstrapTable('filterBy', {
            "graphElementType": typesToFilter
        });
        getAddAllTypeFiltersButton().removeClass("hidden");
        getRemoveAllTypeFiltersButton().removeClass("hidden");
        if (0 === typesToFilter.length) {
            getRemoveAllTypeFiltersButton().addClass("hidden");
        }
        if (3 === typesToFilter.length) {
            getAddAllTypeFiltersButton().addClass("hidden");
        }
    }

    function setupAddAll() {
        getAddAllTypeFiltersButton().click(function (event) {
            event.preventDefault();
            $.each(getFilterByTypeInputs(), function () {
                var input = $(this);
                if (!input.prop("checked")) {
                    input.click();
                }
            });
        });
    }

    function setupRemoveAll() {
        getRemoveAllTypeFiltersButton().click(function (event) {
            event.preventDefault();
            $.each(getFilterByTypeInputs(), function () {
                var input = $(this);
                if (input.prop("checked")) {
                    input.click();
                }
            });
        });
    }

    function getAddAllTypeFiltersButton() {
        return $("#addAllTypeFilters");
    }

    function getRemoveAllTypeFiltersButton() {
        return $("#removeAllTypeFilter");
    }

    function getFilterByTypeInputs() {
        return _container.find(
            $("input.filter-type-checkbox")
        );
    }
});
