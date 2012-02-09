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

import javax.inject.Inject;

/**
 * @author Vincent Blouin
 */
@RunWith(TestatooJunitRunner.class)
@TestatooModules(ContainerModule.class)
public abstract class RestTest {

    protected static String BASE_URL = "http://localhost:" +  System.getProperty("port") + "/service";

    protected WebResource resource;
    protected ClientResponse response;


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
}