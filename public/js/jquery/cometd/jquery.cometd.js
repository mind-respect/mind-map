/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

(function($)
{
    function bind($, org_cometd)
    {
        // Remap cometd JSON functions to jquery JSON functions
        org_cometd.JSON.toJSON = JSON.stringify;
        org_cometd.JSON.fromJSON = JSON.parse;

        function _setHeaders(xhr, headers)
        {
            if (headers)
            {
                for (var headerName in headers)
                {
                    if (headerName.toLowerCase() === 'content-type')
                    {
                        continue;
                    }
                    xhr.setRequestHeader(headerName, headers[headerName]);
                }
            }
        }

        // Remap toolkit-specific transport calls
        function LongPollingTransport()
        {
            var _super = new org_cometd.LongPollingTransport();
            var that = org_cometd.Transport.derive(_super);

            that.xhrSend = function(packet)
            {
                return $.ajax({
                    url: packet.url,
                    async: packet.sync !== true,
                    type: 'POST',
                    contentType: 'application/json;charset=UTF-8',
                    data: packet.body,
                    xhrFields: {
                        // Has no effect if the request is not cross domain
                        // but if it is, allows cookies to be sent to the server
                        withCredentials: true
                    },
                    beforeSend: function(xhr)
                    {
                        _setHeaders(xhr, packet.headers);
                        // Returning false will abort the XHR send
                        return true;
                    },
                    success: packet.onSuccess,
                    error: function(xhr, reason, exception)
                    {
                        packet.onError(reason, exception);
                    }
                });
            };

            return that;
        }

        function CallbackPollingTransport()
        {
            var _super = new org_cometd.CallbackPollingTransport();
            var that = org_cometd.Transport.derive(_super);

            that.jsonpSend = function(packet)
            {
                $.ajax({
                    url: packet.url,
                    async: packet.sync !== true,
                    type: 'GET',
                    dataType: 'jsonp',
                    jsonp: 'jsonp',
                    data: {
                        // In callback-polling, the content must be sent via the 'message' parameter
                        message: packet.body
                    },
                    beforeSend: function(xhr)
                    {
                        _setHeaders(xhr, packet.headers);
                        // Returning false will abort the XHR send
                        return true;
                    },
                    success: packet.onSuccess,
                    error: function(xhr, reason, exception)
                    {
                        packet.onError(reason, exception);
                    }
                });
            };

            return that;
        }

        $.Cometd = function(name)
        {
            var cometd = new org_cometd.Cometd(name);

            // Registration order is important
            if (org_cometd.WebSocket)
            {
                cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
            }
            cometd.registerTransport('long-polling', new LongPollingTransport());
            cometd.registerTransport('callback-polling', new CallbackPollingTransport());

            return cometd;
        };

        // The default cometd instance
        $.cometd = new $.Cometd();

        return $.cometd;
    }

    if (typeof define === 'function' && define.amd)
    {
        define(['jquery', 'org/cometd'], bind);
    }
    else
    {
        bind($, org.cometd);
    }
})(jQuery);
