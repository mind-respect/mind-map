package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.junit.Before;
import org.junit.Test;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

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
        //log(user);
    }

    @Test
    public void can_authenticate_user() throws Exception {
        response = resource.path("users").path("authenticate").queryParam("email", user.email()).queryParam("password", "password").get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

}
