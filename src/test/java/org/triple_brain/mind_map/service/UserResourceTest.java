package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.validator.Validators;
import org.triple_brain.module.repository.user.user.UserRepository;

import javax.inject.Inject;

import static com.ovea.tadjin.util.rest.JSONMessages.FIELD;
import static com.ovea.tadjin.util.rest.JSONMessages.REASON;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.triple_brain.module.model.json.UserJSONFields.*;
import static org.triple_brain.module.model.validator.UserValidator.*;

/**
 * @author Vincent Blouin
 */

public class UserResourceTest extends RestTest {

    @Inject
    UserRepository userRepository;

    @Test
    public void can_authenticate_user() throws Exception {
        User rogerLamothe = User.withEmail("roger.lamothe@example.org")
                .firstName("Roger")
                .lastName("Lamothe")
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
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(201));
        User user = userRepository.findByEmail("roger.lamothe@example.org");
        assertThat(response.getHeaders().get("Location").get(0), is(BASE_URI + "/users/" + user.id()));
    }

    @Test
    public void when_user_creation_fail_a_json_error_message_is_returned() throws Exception {
        JSONArray errors;
        JSONObject jsonUser;
        // Errors on email

        // Already registered email
        createUserWithEmail("roger.lamothe@example.org");
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "asdfasdfjjjasd");
        jsonUser.put(PASSWORD_VERIFICATION, "asdfasdfjjjasd");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.ALREADY_REGISTERED_EMAIL));

        // Email mandatory
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "asdfasdfasd");
        jsonUser.put(PASSWORD_VERIFICATION, "asdfasdfasd");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.MANDATORY_EMAIL));

        // Email invalid (not well formed)
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe$example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "asdfasdfasd");
        jsonUser.put(PASSWORD_VERIFICATION, "asdfasdfasd");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.INVALID_EMAIL));

        // Email too long
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamotheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "asdfasdfasd");
        jsonUser.put(PASSWORD_VERIFICATION, "asdfasdfasd");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.EMAIL_TOO_LONG));

        // Errors on password

        // password mandatory
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(PASSWORD));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.MANDATORY_PASSWORD));

        // password too short
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "pass");
        jsonUser.put(PASSWORD_VERIFICATION, "pass");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(PASSWORD));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.PASSWORD_TOO_SHORT));

        // passwords passed twice need to be the same
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "different_password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(PASSWORD));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(Validators.PASSWORD_VERIFICATION_ERROR));

        // Errors on firstname lastname

        // firstname mandatory
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(FIRST_NAME));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(MANDATORY_FIRST_NAME));

        // lastname mandatory
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.rog");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(LAST_NAME));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(MANDATORY_LAST_NAME));

        // firstname too long
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Rogerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        jsonUser.put(LAST_NAME, "Lamothe");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(FIRST_NAME));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(FIRST_NAME_TOO_LONG));

        // lastname too long
        jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "roger.lamothe@example.org");
        jsonUser.put(FIRST_NAME, "Roger");
        jsonUser.put(LAST_NAME, "Lamotheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        jsonUser.put(PASSWORD, "password");
        jsonUser.put(PASSWORD_VERIFICATION, "password");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(LAST_NAME));
        assertThat(errors.getJSONObject(0).get(REASON).toString(), is(LAST_NAME_TOO_LONG));
    }

    @Test
    public void returned_user_creation_error_messages_are_in_the_right_order() throws Exception {
        JSONObject jsonUser = new JSONObject();
        jsonUser.put(EMAIL, "");
        jsonUser.put(FIRST_NAME, "");
        jsonUser.put(LAST_NAME, "");
        jsonUser.put(PASSWORD, "pass");
        jsonUser.put(PASSWORD_VERIFICATION, "");
        response = resource.path("users").type("application/json").cookie(authCookie).post(ClientResponse.class, jsonUser);
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.getJSONObject(0).get(FIELD).toString(), is(EMAIL));
        assertThat(errors.getJSONObject(1).get(FIELD).toString(), is(FIRST_NAME));
        assertThat(errors.getJSONObject(2).get(FIELD).toString(), is(LAST_NAME));
        assertThat(errors.getJSONObject(3).get(FIELD).toString(), is(PASSWORD));
    }

    private User createUserWithEmail(String email){
        User user = User.withEmail(email)
                .firstName("generated first name")
                .lastName("generated last name")
                .password("password");
        userRepository.save(user);
        return user;
    }
}
