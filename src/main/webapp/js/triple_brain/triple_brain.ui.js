require("Logger", "triple_brain.bus.local");

if (triple_brain.ui == undefined) {

    triple_brain.bus.local.topic('/event/ui/view/create').subscribe(function() {
    });

    (function($) {
        triple_brain.ui = {};
        window.jqmcontrib.bridge(triple_brain.bus.local);
    })(jQuery);
}
