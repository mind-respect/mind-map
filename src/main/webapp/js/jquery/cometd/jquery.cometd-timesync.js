/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

(function($)
{
    function bind(TimeSyncExtension, cometd)
    {
        var result = new TimeSyncExtension();
        cometd.registerExtension('timesync', result);
        return result;
    }

    if (typeof define === 'function' && define.amd)
    {
        define(['org/cometd/TimeSyncExtension', 'jquery.cometd'], bind);
    }
    else
    {
        bind(org.cometd.TimeSyncExtension, $.cometd);
    }
})(jQuery);
