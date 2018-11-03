/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "mr.ask_modal",
    "mr.center-graph-element-service",
    "mr.center-graph-element",
    "triple_brain.event_bus",
    "mr.app_controller",
    "triple_brain.user_service",
    "triple_brain.graph_element_type",
    "moment",
    "mr.color",
    "bootstrap-table",
    "jquery.i18next"
], function ($, IdUri, AskModal, CenterGraphElementService, CenterGraphElement, EventBus, AppController, UserService, GraphElementType, Moment, Color) {
    "use strict";
    var DEFAULT_BACKGROUND_COLOR = "#1E87AF";
    var _elements,
        _container,
        _isOwner,
        tableData = [],
        checkedCenters = [],
        table = $('#word-cloud-table');
    var api = {};
    var $connectedHomeContainer = getConnectedHomeContainer();
    api.enter = function (isOwner) {
        _isOwner = isOwner;
        getWordsContainer().removeClass("hidden");
        setupDisplays();
        if (isOwner) {
            return CenterGraphElementService.getPublicAndPrivate().then(api.setupCenterGraphElements);
        } else {
            return CenterGraphElementService.getPublicOnlyForUsername(
                usernameForBublGuru
            ).then(api.setupCenterGraphElements);
        }
    };
    api.setupCenterGraphElements = function (centers) {
        var centerGraphElements = CenterGraphElement.fromServerFormat(centers);
        if (centerGraphElements.length === 0 && _isOwner) {
            UserService.getDefaultVertexUri(UserService.authenticatedUserInCache().user_name, function (uri) {
                window.location = IdUri.htmlUrlForBubbleUri(uri);
            });
            return;
        }
        if (centerGraphElements.length === 1 && _isOwner) {
            window.location = IdUri.htmlUrlForBubbleUri(centerGraphElements[0].getUri());
            return;
        }
        api.buildFromElementsInContainer(
            centerGraphElements,
            getWordsContainer()
        );
        api.buildCenterElementsInGrid(
            centerGraphElements
        );
        enterGridFlow();
    };
    api.buildCenterElementsInGrid = function (centerGraphElements) {
        var container = $("#grid-flow-container").find(".row");
        centerGraphElements.sort(function (a, b) {
            var aDate = a.getLastCenterDate().getTime();
            var bDate = b.getLastCenterDate().getTime();
            if (aDate < bDate) {
                return 1;
            }
            else if (aDate > bDate) {
                return -1;
            }
            else {
                return 0;
            }
        }).forEach(function (center) {
            var mapColor = center.getColors().background || DEFAULT_BACKGROUND_COLOR;
            var backgroundColor = Color.getBackgroundColorForColor(mapColor);
            container.append(
                $('<div class="col-sm-6 col-md-4 col-lg-2 mt-4 center-card-container">').data(
                    "center", center
                ).append(
                    $("<div class='card'>").append(
                        buildAnchorForElement(center).append(
                            $('<div class="card-text text-center center-label v-center">').append(
                                $("<i class='pull-left fa' style='margin-left:10px;'>").addClass(
                                    getIconClassFromElementUri(center.getUri())
                                ),
                                $("<div class='label-container spacer'>").addClass(
                                    center.getLabel().length <= 30 ? "vh-center" : ""
                                ).append(
                                    $('<div class="title text-bold">').text(
                                        center.getLabel()
                                    )
                                )
                            ),
                            $("<div class='card-block card-text'>").append(
                                getContextCellContentForElement(center, true)
                            ).addClass(
                                Object.keys(center.getContext()).length === 0 ? "vh-center" : ""
                            ).css(
                                "background-color", backgroundColor
                            )
                        ),
                        $('<div class="card-footer v-center h-center">').append(
                            new Moment(center.getLastCenterDate()).fromNow(),
                            // $('<i class="fa fa-ellipsis-v icon-btn">'),
                            $('<a href="#">').append(
                                $('<i class="fa fa-trash" style="color: rgba(0, 0, 0, 0.4); margin-left:15px;">')
                            ).click(function (event) {
                                event.preventDefault();
                                var container = $(this).closest('.center-card-container');
                                var centers = [
                                    container.data("center")
                                ];
                                var centersUri = centers.map(function (center) {
                                    return center.getUri();
                                });
                                askToRemoveCenters(centers).then(function () {
                                    removeUrisFromUi(centersUri);
                                    return CenterGraphElementService.removeCentersWithUri(
                                        centersUri
                                    );
                                });
                            })
                            // $('<button type="button" class="owner-only remove remove-center-btn btn btn-primary pull-right small" data-i18n="[title]centralBubbles.removeInfo">').append(
                            //     $('<i class="fa fa-trash">')
                            // )
                        )
                    )
                )
            )
            ;
            // tableData.push({
            //     uri: element.getUri(),
            //     centerElement: element,
            //     bubbleLabel: getLabelCellContentForElement(element),
            //     bubbleLabelValue: element.getLabel(),
            //     graphElementType: IdUri.getGraphElementTypeFromUri(element.getUri()),
            //     context: getContextCellContentForElement(element),
            //     lastVisit: getLastVisitCellContentForElement(element),
            //     lastVisitValue: element.getLastCenterDate().getTime()
            // });
        });
    };
    api.buildFromElementsInContainer = function (elements, container) {
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
    };
    return api;


    function buildHtml() {
        tableData = [];
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
                $(".fixed-table-toolbar .search input").addClass(
                    "hidden"
                );
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

    function getContextCellContentForElement(element, noLink) {
        var container = $("<div class='around-list'>");
        if (!noLink) {
            var anchor = buildAnchorForElement(element);
            container.appendTo(
                anchor
            );
        }
        var contextUris = Object.keys(element.getContext());
        if (contextUris.length < 1) {
            if (noLink) {
                container.addClass("empty");
            } else {
                anchor.addClass("empty").text(
                    "empty label"
                );
            }
        }
        for (var i = 0; i < contextUris.length; i++) {
            var text = element.getContext()[contextUris[i]];
            container.append(
                $("<div class='around-list-item'>").text(
                    text
                )
            );
        }
        return noLink ? container : anchor.prop('outerHTML');
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
    }

    function hideElementsForOwnerOnlyIfApplicable() {
        if (UserService.hasCurrentUser() && IdUri.currentUsernameInUrl() === UserService.authenticatedUserInCache().user_name) {
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
            removeUrisFromUi(centersUri);
            checkedCenters = [];
            return CenterGraphElementService.removeCentersWithUri(
                centersUri
            );
        });
    }

    function askToRemoveCenters(centers) {
        displayCentersLabelToRemove(centers);
        var modal = $("#remove-centers-confirm-menu").modal();
        centers = centers || checkedCenters;
        var hasMultipleCheckedElements = centers.length > 1;
        var askModal = AskModal.usingModalHtml(modal, hasMultipleCheckedElements);
        return askModal.ask();
    }

    function displayCentersLabelToRemove(centers) {
        centers = centers || checkedCenters;
        var ul = $("#remove-centers-list").empty();
        centers.forEach(function (centerElement) {
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
        $connectedHomeContainer.find(".center-card-container").each(function () {
            var center = $(this).data("center");
            var graphElementType = IdUri.getGraphElementTypeFromUri(
                center.getUri()
            );
            var isInTypes = typesToFilter.some(function (type) {
                return graphElementType === type;
            });
            if (isInTypes) {
                $(this).removeClass("hidden");
            } else {
                $(this).addClass("hidden");
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

    function getWordsContainer() {
        return $("#word-cloud");
    }

    function setupDisplays() {
        $("#centers-to-grid").off(enterGridFlow).click(enterGridFlow);
        $("#centers-to-list").off(enterTableFlow).click(enterTableFlow);
        $("#centers-search-filter").on("keyup", function () {
            var searchValue = $(this).val();
            $(".fixed-table-toolbar .search input").val(searchValue).keyup();
            $connectedHomeContainer.find(".center-card-container").each(function () {
                var center = $(this).data("center");
                var inLabel = center.getLabel().toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
                var inSurround = Object.values(center.getContext()).join(" ").toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
                if (inLabel || inSurround) {
                    $(this).removeClass("hidden");
                } else {
                    $(this).addClass("hidden");
                }
            });
        });
    }

    function enterTableFlow(event) {
        if (event) {
            event.preventDefault();
        }
        $("#centers-to-list").addClass("hidden");
        $("#centers-to-grid").removeClass("hidden");
        $connectedHomeContainer.find(".table-flow").removeClass(
            "hidden"
        );
        $connectedHomeContainer.find(".grid-flow").addClass(
            "hidden"
        );
        $connectedHomeContainer.find(".bootstrap-table").removeClass("hidden");
    }

    function enterGridFlow(event) {
        if (event) {
            event.preventDefault();
        }
        $("#centers-to-grid").addClass("hidden");
        $("#centers-to-list").removeClass("hidden");
        $connectedHomeContainer.find(".table-flow").addClass(
            "hidden"
        );
        $connectedHomeContainer.find(".grid-flow").removeClass(
            "hidden"
        );
        $connectedHomeContainer.find(".bootstrap-table").addClass("hidden");
    }

    function getConnectedHomeContainer() {
        return $("#connected-home-flow");
    }

    function removeUrisFromUi(centersUri) {
        table.bootstrapTable('remove', {field: 'uri', values: centersUri});
        $(".center-card-container").each(function () {
            var $centerContainer = $(this);
            var containerCenterUri = $centerContainer.data("center").getUri();
            centersUri.forEach(function (centerUri) {
                if (containerCenterUri === centerUri) {
                    $centerContainer.remove();
                }
            });
        });
    }
});
