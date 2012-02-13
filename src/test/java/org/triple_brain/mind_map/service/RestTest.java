package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.junit.After;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.testatoo.config.annotation.TestatooModules;
import org.testatoo.config.junit.TestatooJunitRunner;
import org.triple_brain.mind_map.service.conf.ContainerModule;
import org.triple_brain.module.model.User;

import javax.ws.rs.core.NewCookie;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

/**
 * @author Vincent Blouin
 */
@RunWith(TestatooJunitRunner.class)
@TestatooModules(ContainerModule.class)
public abstract class RestTest {

    protected static String BASE_URL = "http://localhost:" +  System.getProperty("port") + "/service";

    protected WebResource resource;
    protected ClientResponse response;
    protected NewCookie loggedCookie;

    @Before
    public void init() throws Exception {
        resource = createClient().resource(BASE_URL);
    }

    @After
    public void showServerError() {
        if (response != null) {
            try {
                if (response.getStatus() != 200)
                    System.err.println(response.getEntity(String.class));
            } catch (Exception ignored) {
                // simply ignore exceptions here - no output
            }
            response.close();
        }
    }

    protected Client createClient() {
        return Client.create();
    }

    protected void log(User user) {
        response = resource.path("users").path("authenticate").queryParam("email", user.email()).queryParam("password", "password").cookie(loggedCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        loggedCookie = response.getCookies().get(0);
    }
}