package org.triple_brain.mind_map;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;
import org.eclipse.jetty.xml.XmlConfiguration;

import java.io.File;

public class Launcher {
    private Server server;

    private int port = 0;

    public Launcher() throws Exception{
        this(8080);
    }

    public Launcher(int port) throws Exception {
        this.port = port;
        server = new Server(port);
        HandlerCollection handlers = new HandlerCollection();

        WebAppContext mindMapWebappContext = new WebAppContext("src/main/webapp", "/test");
        handlers.addHandler(mindMapWebappContext);

        String serviceWebappBasePath = "/home/vince/Projects/triple_brain/webapp/service/src/";
        WebAppContext serviceWebappContext = new WebAppContext(serviceWebappBasePath + "/main/webapp", "/");
        handlers.addHandler(serviceWebappContext);
        XmlConfiguration conf = new XmlConfiguration(new File(serviceWebappBasePath +  "test/webapp/WEB-INF/jetty-web.xml").toURI().toURL().openStream());
        conf.configure(serviceWebappContext);

        server.setHandler(handlers);
    }

    int getPort() {
        return port;
    }

    public void launch() throws Exception {

        server.start();
    }

    public void stop() throws Exception {

        server.stop();
    }
}
