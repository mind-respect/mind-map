package org.triple_brain.mind_map.service;

import org.cometd.bayeux.server.BayeuxServer;

import javax.servlet.GenericServlet;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import java.io.IOException;

/*
* Copyright Mozilla Public License 1.1
*/
public class BayeuxInitializer extends GenericServlet {
    public static NotificationService notificationService;
    @Override
    public void init(){
        BayeuxServer bayeux = (BayeuxServer)getServletContext().getAttribute(BayeuxServer.ATTRIBUTE);
        notificationService = new NotificationService(bayeux);
    }
    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        throw new ServletException();
    }
}
