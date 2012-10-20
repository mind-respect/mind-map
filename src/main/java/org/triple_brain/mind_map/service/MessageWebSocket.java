package org.triple_brain.mind_map.service;

import org.eclipse.jetty.websocket.WebSocket;

import java.util.Set;

/*
* Copyright Mozilla Public License 1.1
*/

public class MessageWebSocket implements WebSocket.OnTextMessage {

    private Connection connection;

    private Set<MessageWebSocket> users;


    public MessageWebSocket(Set users) {
        this.users = users;
    }

    @Override
    public void onMessage(String data) {
        for (MessageWebSocket user : users) {
            try {
                user.connection.sendMessage(data);

            } catch (Exception e) {
            }
        }
    }

    @Override
    public void onOpen(Connection connection) {
        this.connection = connection;
        users.add(this);
    }

    @Override
    public void onClose(int closeCode, String message) {
        users.remove(this);
    }
}
