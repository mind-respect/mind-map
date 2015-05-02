/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([], function () {
    var api = {};
    api.fromHtml = function (html) {
        return new Self(
            html
        );
    };
    function Self(html) {
        this.html = html;
    }

    Self.prototype.showOnlyIfApplicable = function (clickHandler, selected) {
        var canActionBePerformed = this.canActionBePerformedOnSelected(
            selected, clickHandler
        );
        this.html[
            canActionBePerformed ?
                "show" : "hide"
            ]();
        var onlyOneSelected = !Array.isArray(selected);
        if (onlyOneSelected) {
            selected.getSimilarButtonHtml(this)[
                canActionBePerformed ?
                    "show" : "hide"
                ]();
        }
        else {
            this._hideMenuOfElements(selected);
        }
    };
    Self.prototype.canActionBePossiblyMade = function (clickHandler) {
        return clickHandler[
            this.getAction()
            ] !== undefined;
    };
    Self.prototype.canActionBePerformedOnSelected = function (selected, clickHandler) {
        if (!this.canActionBePossiblyMade(clickHandler)) {
            return false;
        }
        var methodToCheckIfActionCanBePerformedForElements = clickHandler[
            this.getAction() + "CanDo"
            ];
        if (undefined === methodToCheckIfActionCanBePerformedForElements) {
            return true;
        }
        return methodToCheckIfActionCanBePerformedForElements(
            selected
        );
    };
    Self.prototype.getHtml = function () {
        return this.html;
    };
    Self.prototype.getAction = function () {
        return this.html.attr(
            "data-action"
        );
    };
    Self.prototype.getIconClass = function () {
        return this.html.attr(
            "data-icon"
        );
    };
    Self.prototype.cloneInto = function (container) {
        var copyBehavior = true;
        this.html.clone(
            copyBehavior
        ).appendTo(
            container
        ).show();
    };
    Self.prototype._hideMenuOfElements = function (elements) {
        $.each(elements, function () {
            var element = this;
            element.hideMenu();
        });
    };
    return api;
});