package org.triple_brain.mind_map.service.utils;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.client.apache.config.DefaultApacheHttpClientConfig;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.triple_brain.mind_map.Launcher;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.json.UserJsonFields;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.sql.SQLException;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;
import static org.triple_brain.module.repository_sql.SQLConnection.*;


/**
 * Copyright Mozilla Public License 1.1
 */
public abstract class RestTest {

    protected static URI BASE_URI;
    protected static WebResource resource;
    static private Launcher launcher;
    static public Client client;
    protected NewCookie authCookie;

    public static final String DEFAULT_PASSWORD = "password";

    @BeforeClass
    static public void startServer() throws Exception {
        BASE_URI = new URI("http://localhost:8786");

        launcher = new Launcher(BASE_URI.getPort());
        launcher.launch();

        DefaultApacheHttpClientConfig clientConfig = new DefaultApacheHttpClientConfig();
        clientConfig.getProperties().put("com.sun.jersey.impl.client.httpclient.handleCookies", true);
        client = Client.create(clientConfig);
        cleanTables();
        resource = client.resource(BASE_URI);
    }

    @AfterClass
    static public void stopServer() throws Exception {
        closeSearchEngine();
        launcher.stop();
    }

    @Before
    public void before_rest_test() throws SQLException {
        cleanTables();
    }

    @After
    public void after_rest_test() throws SQLException {
        closeConnection();
    }

    private static void closeSearchEngine() {
        ClientResponse response = resource
                .path("users")
                .path("test")
                .path("search")
                .path("close")
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    static protected void cleanTables() throws SQLException {
        clearDatabases();
        createTables();
    }

    protected void createAUser(JSONObject userAsJson) {
       ClientResponse response = resource
                .path("users/")
                .cookie(authCookie)
                .type(MediaType.APPLICATION_JSON)
                .post(ClientResponse.class, userAsJson);
        assertThat(response.getStatus(), is(Response.Status.CREATED.getStatusCode()));
    }

    protected User authenticate(User user) {
        try{
            JSONObject loginInfo = new JSONObject()
                    .put(
                            UserJsonFields.EMAIL,
                            user.email()
                    )
                    .put(UserJsonFields.PASSWORD, DEFAULT_PASSWORD);
            ClientResponse response = resource
                    .path("users")
                    .path("session")
                    .post(ClientResponse.class, loginInfo);
            assertThat(response.getStatus(), is(200));
            authCookie = response.getCookies().get(0);
            return user;
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
    }

    protected JSONObject authenticate(JSONObject user) {
        try{
            JSONObject loginInfo = new JSONObject()
                    .put(
                            UserJsonFields.EMAIL,
                            user.getString(UserJsonFields.EMAIL)
                    )
                    .put(UserJsonFields.PASSWORD, DEFAULT_PASSWORD);
            ClientResponse response = resource
                    .path("users")
                    .path("session")
                    .post(ClientResponse.class, loginInfo);
            assertThat(response.getStatus(), is(Response.Status.OK.getStatusCode()));
            authCookie = response.getCookies().get(0);
            return response.getEntity(JSONObject.class);
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
    }
}