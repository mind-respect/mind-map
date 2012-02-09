require("Logger", "Store");

if (window.triple_brain == undefined) {
    (function($) {
        window.triple_brain= {
            jsonify: function(o) {
                return (JSON && JSON.stringify ? JSON.stringify : $.toJSON)(o, null, '  ');
            }
        };
    })(jQuery);
}
