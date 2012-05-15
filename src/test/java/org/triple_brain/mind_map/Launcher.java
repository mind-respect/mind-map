package org.triple_brain.mind_map;

import org.eclipse.jetty.security.HashLoginService;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;
import org.eclipse.jetty.xml.XmlConfiguration;

import java.io.File;

/**
 * @author VincentBlouin
 */

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

        WebAppContext wac = new WebAppContext("src/main/webapp", "/");
        handlers.addHandler(wac);

        HashLoginService myrealm = new HashLoginService("Localhost", "src/test/webapp/WEB-INF/realm.properties");
        server.addBean(myrealm);

        XmlConfiguration conf = new XmlConfiguration(new File("src/test/webapp/WEB-INF/jetty-web.xml").toURI().toURL().openStream());
        conf.configure(wac);

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
