require("triple_brain", "Logger", "EventBus");

if (triple_brain.bus == undefined) {
    (function($) {

        triple_brain.bus = {
            local: new EventBus({
                name: 'EventBus Local'
            })
        };

    })(jQuery);
}