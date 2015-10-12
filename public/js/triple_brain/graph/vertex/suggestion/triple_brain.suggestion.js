/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.friendly_resource",
        "triple_brain.identification",
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.suggestion_origin"
    ],
    function ($, FriendlyResource, Identification, IdUri, UserService, SuggestionOrigin) {
        "use strict";
        var api = {
            IDENTIFICATION_PREFIX: "identification_"
        };
        api.fromServerFormat = function (serverFormat) {
            return new Suggestion(
                serverFormat
            );
        };
        api.fromServerArray = function (serverArray) {
            var suggestions = [];
            $.each(serverArray, function () {
                suggestions.push(
                    api.fromServerFormat(
                        this
                    )
                );
            });
            return suggestions;
        };
        api.fromSchemaPropertyAndOriginUri = function (schemaProperty, originUri) {
            var suggestionUri = api.generateUri();
            var serverFormat = {
                friendlyResource: FriendlyResource.buildObjectWithUriAndLabel(
                    suggestionUri,
                    schemaProperty.getLabel()
                ),
                sameAs: FriendlyResource.buildObjectWithUriAndLabel(
                    schemaProperty.getUri(),
                    schemaProperty.getLabel()
                ),
                origins: [
                    SuggestionOrigin.buildObjectWithUriAndOrigin(
                        api.generateOriginUriFromSuggestionUri(suggestionUri),
                        api.IDENTIFICATION_PREFIX + originUri
                    )
                ]
            };
            var suggestion = api.fromServerFormat(serverFormat);
            if (schemaProperty.hasIdentifications()) {
                var identification = schemaProperty.getIdentifications()[0];
                suggestion._setType(
                    identification
                );
            }
            return suggestion;
        };
        api.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = {};
            $.each(suggestions, function () {
                var suggestion = this;
                suggestionsFormatedForServer[
                    suggestion.getUri()
                    ] = suggestion.getServerFormat();
            });
            return JSON.stringify(suggestionsFormatedForServer);
        };

        api.generateOriginUriFromSuggestionUri = function (suggestionUri) {
            return suggestionUri + "/origin/" + IdUri.generateUuid();
        };
        api.generateUri = function () {
            return UserService.currentUserUri() + "/suggestion/" + IdUri.generateUuid();
        };

        function Suggestion(serverFormat) {
            this.sameAs = Identification.fromFriendlyResourceServerFormat(
                serverFormat.sameAs
            );
            if (serverFormat.type !== undefined) {
                this.type = Identification.fromFriendlyResourceServerFormat(
                    serverFormat.type
                );
            }
            this.origins = SuggestionOrigin.fromServerArray(
                serverFormat.origins
            );
            FriendlyResource.Self.apply(
                this
            );
            FriendlyResource.Self.prototype.init.call(
                this,
                serverFormat.friendlyResource
            );
        }
        Suggestion.prototype = new FriendlyResource.Self();

        Suggestion.prototype.getSameAs = function () {
            return this.sameAs;
        };
        Suggestion.prototype.getType = function () {
            return this.type;
        };
        Suggestion.prototype._setType = function (type) {
            return this.type = type;
        };
        Suggestion.prototype.hasType = function () {
            return this.type !== undefined;
        };
        Suggestion.prototype.getOrigin = function () {
            return this.origins[0];
        };
        Suggestion.prototype.hasIdentificationForOrigin = function (identification) {
            return (api.IDENTIFICATION_PREFIX + identification.getExternalResourceUri()) ===
                this.getOrigin().getOrigin();
        };
        Suggestion.prototype.getServerFormat = function () {
            var serverFormatGetter = FriendlyResource.Self.prototype.getServerFormat;
            return {
                friendlyResource: serverFormatGetter.call(
                    this
                ),
                sameAs: serverFormatGetter.call(this.getSameAs()),
                type: (this.hasType() ? serverFormatGetter.call(this.getType()) : undefined),
                origins: this._getOriginsServerFormat()
            };
        };
        Suggestion.prototype._getOriginsServerFormat = function () {
            var origins = [];
            $.each(this.origins, function () {
                var origin = this;
                origins.push(
                    origin.getServerFormat()
                );
            });
            return origins;
        };
        return api;
    }
);