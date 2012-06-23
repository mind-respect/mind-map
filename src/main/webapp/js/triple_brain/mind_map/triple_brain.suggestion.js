
if (triple_brain.suggestion == undefined) {
    (function($) {
            var eventBus = triple_brain.event_bus;
            triple_brain.suggestion = {
            autoComplete: function(textField) {
                var textFieldValBeforeCall = $(textField).val();
                $.ajax({
                    type: 'GET',
                    url: 'http://freebase.com/api/service/search?query=' + $(textField).val(),
                    dataType: 'jsonp'
                }).success(function(response) {
                    var areAutoCompleteSuggestionsStillRelevant = $(textField).val() == textFieldValBeforeCall;
                    if(areAutoCompleteSuggestionsStillRelevant){
                        eventBus.publish(
                            '/event/ui/graph/auto_complete/updated/',
                            [textField, response.result]
                        );
                    }
                })
             }
        }

    })(jQuery);

}