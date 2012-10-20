package org.triple_brain.mind_map.service;

import org.eclipse.jetty.websocket.WebSocket;
import org.eclipse.jetty.websocket.WebSocketServlet;

import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/*
* Copyright Mozilla Public License 1.1
*/
@Singleton
public class MessagesDistributorServlet extends WebSocketServlet {

    public final Set users = new CopyOnWriteArraySet();

    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response) throws ServletException, IOException {}

    @Override
    public WebSocket doWebSocketConnect(HttpServletRequest httpServletRequest, String s) {
        return new MessageWebSocket(users);
    }
}
