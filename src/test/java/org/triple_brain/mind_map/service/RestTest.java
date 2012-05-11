package org.triple_brain.mind_map.service;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.client.apache.config.DefaultApacheHttpClientConfig;
import graph.JenaSQLTestModule;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.triple_brain.mind_map.Launcher;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.UserRepository;
import org.triple_brain.module.repository_sql.SQLTestModule;

import javax.inject.Inject;
import javax.ws.rs.core.NewCookie;
import java.net.URI;
import java.sql.SQLException;
import java.util.UUID;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;
import static org.triple_brain.module.repository_sql.SQLConnection.*;


    /**
 * Copyright Mozilla Public License 1.1
 */
public abstract class RestTest{

   protected static URI BASE_URI;
   protected WebResource resource;
   protected ClientResponse response;
   static private Launcher launcher;
   static private Client client;
   protected NewCookie authCookie;

    @Inject
    UserRepository userRepository;


    @BeforeClass
    static public void startServer() throws Exception {
        Guice.createInjector(new SQLTestModule(), new JenaSQLTestModule());
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
        Injector injector = Guice.createInjector(
                new SQLTestModule(),
                new JenaSQLTestModule()
        );
        injector.injectMembers(this);
        cleanTables();
        resource = client.resource(BASE_URI);
    }

    @After
    public void after_rest_test()throws SQLException{
        closeConnection();
    }

    static protected void cleanTables()throws SQLException {
        clearDatabases();
        createTables();
    }


    protected User authenticate(){
        return authenticate(
                createAUser()
        );
    }

    protected User createAUser(){
        User user = User.withUsernameAndEmail(
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString() + "@triplebrain.org")
                .password("password");
        userRepository.save(user);
        return user;
    }

    protected User authenticate(User user) {
        response = resource.path("users").path("authenticate").queryParam("email", user.email()).queryParam("password", "password").cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        authCookie = response.getCookies().get(0);
        return user;
    }

}