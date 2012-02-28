package org.triple_brain.mind_map.service;
import com.google.inject.Binder;
import com.google.inject.Module;
import com.google.inject.Stage;
import com.google.inject.util.Modules;
import com.mycila.inject.jsr250.Jsr250;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.client.apache.config.DefaultApacheHttpClientConfig;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.triple_brain.mind_map.Launcher;
import org.triple_brain.module.repository.user.user.UserRepository;
import org.triple_brain.module.repository_sql.SQLModule;
import org.triple_brain.module.repository_sql.SQLUserRepository;

import java.net.URI;
import java.sql.SQLException;

import static org.triple_brain.module.repository_sql.SQLConnection.closeConnection;
import static org.triple_brain.module.repository_sql.SQLConnection.preparedStatement;


/**
 * @author Vincent Blouin
 */
public abstract class RestTest implements Module {

   protected static URI BASE_URI;
   protected WebResource resource;
   protected ClientResponse response;
   static private Launcher launcher;
   static private Client client;

    @BeforeClass
    static public void startServer() throws Exception {
        BASE_URI = new URI("http://localhost:8080/service");
        
        launcher = new Launcher();
        launcher.launch();

        DefaultApacheHttpClientConfig clientConfig = new DefaultApacheHttpClientConfig();
        clientConfig.getProperties().put("com.sun.jersey.impl.client.httpclient.handleCookies", true);
        client = Client.create(clientConfig);
        cleanTables();
    }

    @AfterClass
    static public void stopServer() throws Exception {
        launcher.stop();
    }

    @Before
    public void before_rest_test()throws SQLException{
        Jsr250.createInjector(Stage.PRODUCTION, Modules.override(new SQLModule()).with(this)).injectMembers(this);
        resource = client.resource(BASE_URI);
    }

    @After
    public void after_rest_test()throws SQLException{
        closeConnection();
    }

    static protected void cleanTables()throws SQLException {
        String query = "DROP TABLE IF EXISTS por_user;";
        preparedStatement(query).executeUpdate();
        createTables();
    }

    static protected void createTables() throws SQLException{
        String query = "CREATE TABLE por_user (\n" +
                "    id           BIGINT    PRIMARY KEY AUTO_INCREMENT,\n" +
                "    creationTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
                "    updateTime   TIMESTAMP NOT NULL,\n" +
                "\n" +
                "    uuid   VARCHAR(36)   UNIQUE NOT NULL,\n" +
                "    email  VARCHAR(50)   UNIQUE NOT NULL,\n" +
                "    locale VARCHAR(10)   NOT NULL DEFAULT 'en_US',\n" +
                "\n" +
                "    salt                 VARCHAR(36),\n" +
                "    passwordHash         VARCHAR(100),\n" +
                "    firstname            VARCHAR(50),\n" +
                "    lastname             VARCHAR(50)\n" +
                ");";
        preparedStatement(query).executeUpdate();
    }

    @Override
    public final void configure(Binder binder) {
        binder.bind(UserRepository.class).to(SQLUserRepository.class);
    }

}