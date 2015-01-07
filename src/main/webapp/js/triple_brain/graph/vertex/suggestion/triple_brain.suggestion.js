/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.freebase_uri",
        "triple_brain.friendly_resource",
        "triple_brain.identification",
        "triple_brain.id_uri",
        "triple_brain.user",
        "triple_brain.suggestion_origin",
        "jquery.json.min"
    ],
    function ($, FreebaseUri, FriendlyResource, Identification, IdUri, UserService, SuggestionOrigin) {
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
        api.fromFreebaseSuggestionAndOriginUri = function (freebaseSuggestion, typeUri) {
            var suggestionUri = api.generateUri();
            if(freebaseSuggestion.name === null){
                freebaseSuggestion.name = "";
            }
            if(freebaseSuggestion.expected_type.name === null){
                freebaseSuggestion.expected_type.name = "";
            }
            return api.fromServerFormat({
                friendlyResource: FriendlyResource.buildObjectWithUriAndLabel(
                    suggestionUri,
                    freebaseSuggestion.name
                ),
                sameAs: FriendlyResource.buildObjectWithUriLabelAndDescription(
                    FreebaseUri.freebaseIdToUri(
                        freebaseSuggestion.id
                    ),
                    freebaseSuggestion.name,
                    FreebaseUri.descriptionInFreebaseResult(freebaseSuggestion)
                ),
                type: FriendlyResource.buildObjectWithUriLabelAndDescription(
                    FreebaseUri.freebaseIdToUri(
                        freebaseSuggestion.expected_type.id
                    ),
                    freebaseSuggestion.expected_type.name,
                    FreebaseUri.descriptionInFreebaseResult(freebaseSuggestion.expected_type)
                ),
                origins: [SuggestionOrigin.buildObjectWithUriAndOrigin(
                    api.generateOriginUriFromSuggestionUri(suggestionUri),
                        api.IDENTIFICATION_PREFIX + typeUri
                )]
            });
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
            if (schemaProperty.hasIdentifications()) {
                var identification = schemaProperty.getIdentifications()[0];
                serverFormat.type = FriendlyResource.buildObjectWithUriAndLabel(
                    identification.getExternalResourceUri(),
                    identification.getLabel()
                );
            }
            return api.fromServerFormat(serverFormat);
        };
        api.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = {};
            $.each(suggestions, function () {
                var suggestion = this;
                suggestionsFormatedForServer[
                    suggestion.getUri()
                    ] = suggestion.getServerFormat();
            });
            return $.toJSON(suggestionsFormatedForServer);
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
            if(serverFormat.type !== undefined){
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

        Suggestion.prototype = new FriendlyResource.Self;

        Suggestion.prototype.getSameAs = function () {
            return this.sameAs;
        };
        Suggestion.prototype.getType = function () {
            return this.type;
        };
        Suggestion.prototype.hasType = function () {
            return this.type !== undefined;
        };
        Suggestion.prototype.getOrigin = function () {
            return this.origins[0];
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
            }
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