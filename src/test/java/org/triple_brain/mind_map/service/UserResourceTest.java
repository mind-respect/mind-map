package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;
import java.util.UUID;

import static com.ovea.tadjin.util.rest.JSONMessages.FIELD;
import static com.ovea.tadjin.util.rest.JSONMessages.REASON;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.triple_brain.module.model.json.UserJSONFields.*;
import static org.triple_brain.module.model.validator.UserValidator.*;

/**
 * Copyright Mozilla Public License 1.1
 */

public class UserResourceTest extends RestTest {

    @Inject
    UserRepository userRepository;

    @Test
    public void can_authenticate_user() throws Exception {
        User rogerLamothe = User.withUsernameAndEmail("roger_lamothe", "roger.lamothe@example.org")
                .password("password");
        userRepository.save(rogerLamothe);
        response = resource.path("users").path("authenticate").queryParam("email", "roger.lamothe@example.org").queryParam("password", "password").get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    @Test
    public void can_create_user() throws Exception {
        try {
            userRepository.findByEmail("roger.lamothe@example.org");
            fail();
        } catch (Exception e) {
        }

        JSONObject jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(USER_NAME, "roger_lamothe");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(201));
        User user = userRepository.findByEmail("roger.lamothe@example.org");
        assertThat(response.getHeaders().get("Location").get(0), is(BASE_URI + "/users/" + user.id()));
    }

    @Test
    public void cant_register_same_email_twice() throws Exception {
        createUserWithEmail("roger.lamothe@example.org");
        JSONObject jsonUser = validUser().put(EMAIL, "roger.lamothe@example.org");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(ALREADY_REGISTERED_EMAIL));
    }

    @Test
    public void cant_register_same_user_name_twice() throws Exception {
        createUserWithUsername("roger_lamothe");
        JSONObject jsonUser = validUser().put(USER_NAME, "roger_lamothe");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(USER_NAME));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(USER_NAME_ALREADY_REGISTERED));
    }

    @Test
    public void returned_user_creation_error_messages_are_in_the_right_order() throws Exception {
        JSONObject jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "");
        jsonUser.put(USER_NAME, "");
        jsonUser.put(PASSWORD, "pass");
        jsonUser.put(PASSWORD_VERIFICATION, "");
        response = resource.path("users").type("application/json").cookie(authCookie).post(ClientResponse.class, jsonUser);
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(1).get(FIELD).toString(), is(USER_NAME));
        assertThat(errors.getJSONObject(2).get(FIELD).toString(), is(PASSWORD));
    }

    private JSONObject validUser() throws Exception{
        JSONObject user = new JSONObject();
        user.put(USER_NAME, randomUsername());
        user.put(EMAIL, randomEmail());
        user.put(PASSWORD, "generated password");
        user.put(PASSWORD_VERIFICATION, "generated password");
        return user;
    }

    private User createUserWithEmail(String email){
        User user = User.withUsernameAndEmail(randomUsername(), email)
                .password("password");
        userRepository.save(user);
        return user;
    }

    private User createUserWithUsername(String username){
        User user = User.withUsernameAndEmail(username, randomEmail())
                .password("password");
        userRepository.save(user);
        return user;
    }
    
    private String randomEmail(){
        return UUID.randomUUID().toString() + "@example.org";
    }

    private String randomUsername(){
        return UUID.randomUUID().toString().substring(0, 15);
    }
}
