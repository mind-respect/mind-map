require("Logger");

if (triple_brain.suggestion == undefined) {

    var logger = new Logger('triple_brain.suggestion');

    (function($) {
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
                        triple_brain.bus.local.topic('/event/ui/graph/auto_complete/updated/').publish(textField, response.result);
                    }
                })
             }
        }

    })(jQuery);

}