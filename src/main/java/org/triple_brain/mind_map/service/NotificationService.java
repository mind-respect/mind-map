package org.triple_brain.mind_map.service;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.BayeuxServer;
import org.cometd.bayeux.server.ServerChannel;
import org.cometd.bayeux.server.ServerSession;
import org.cometd.common.HashMapMessage;
import org.cometd.server.AbstractService;

/*
* Copyright Mozilla Public License 1.1
*/
public class NotificationService extends AbstractService {

    public static final String PUSHED_JSON_KEY = "pushed_json";

    public NotificationService(BayeuxServer bayeux) {
        super(
                bayeux,
                "notification"
        );

    }

    public void notifyChannelMessage(String channel){
        notifyChannelMessage(
                channel,
                (Object) new JSONObject()
        );
    }
    public void notifyChannelMessage(String channel, JSONObject data){
        notifyChannelMessage(
                channel,
                (Object) data
        );
    }

    public void notifyChannelMessage(String channel, JSONArray data){
        notifyChannelMessage(
                channel,
                (Object) data
        );
    }

    private void notifyChannelMessage(String channel, Object data){
        Message message = new HashMapMessage();
        message.put(
                Message.CHANNEL_FIELD,
                channel
        );
        message.put(PUSHED_JSON_KEY, data);
        notifyWithMessage(
                this.getServerSession(),
                message
        );
    }

    private void notifyWithMessage(ServerSession remote, Message message){
        ServerChannel channel = getBayeux().getChannel(message.getChannel());
        if (channel != null)
        {
            // Broadcast the data
            channel.publish(
                    this.getLocalSession(),
                    message.get(PUSHED_JSON_KEY).toString(),
                    null
            );
        }
    }
}
