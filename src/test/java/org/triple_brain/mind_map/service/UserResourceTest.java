package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONObject;
import org.junit.*;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;
import javax.ws.rs.core.Cookie;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.triple_brain.module.model.json.UserJSONFields.*;

/**
 * @author Vincent Blouin
 */
public class UserResourceTest extends RestTest {

    @Inject
    UserRepository userRepository;

    private User user;

    @Before
    public void setUp() {
        user = User.withEmail("user@triplebrain.org").password("password");
        userRepository.save(user);
        log(user);
    }

    @Test
    public void can_authenticate_user() throws Exception {
        response = resource.path("users").path("authenticate").queryParam("email", user.email()).queryParam("password", "password").get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));

        Cookie loggedCookie = response.getCookies().get(0);

        response = resource.path("users").path("me").cookie(loggedCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject jsonUser = response.getEntity(JSONObject.class);
        assertThat(jsonUser.getString(EMAIL), is("user@actimenu.ca"));
    }

}
