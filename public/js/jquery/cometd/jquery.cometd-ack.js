/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

(function($)
{
    function bind(AckExtension, cometd)
    {
        var result = new AckExtension();
        cometd.registerExtension('ack', result);
        return result;
    }

    if (typeof define === 'function' && define.amd)
    {
        define(['org/cometd/AckExtension', 'jquery.cometd'], bind);
    }
    else
    {
        bind(org.cometd.AckExtension, $.cometd);
    }
})(jQuery);
