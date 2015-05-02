/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

(function($)
{
    function bind(TimeStampExtension, cometd)
    {
        var result = new TimeStampExtension();
        cometd.registerExtension('timestamp', result);
        return result;
    }

    if (typeof define === 'function' && define.amd)
    {
        define(['org/cometd/TimeStampExtension', 'jquery.cometd'], bind);
    }
    else
    {
        bind(org.cometd.TimeStampExtension, $.cometd);
    }
})(jQuery);
