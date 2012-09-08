package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.TripleBrainUris;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.UserRepository;

import javax.inject.Inject;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.*;
import static org.triple_brain.graphmanipulator.jena.JenaConnection.modelMaker;
import static org.triple_brain.module.model.json.UserJSONFields.*;
import static org.triple_brain.module.model.validator.UserValidator.ALREADY_REGISTERED_EMAIL;
import static org.triple_brain.module.model.validator.UserValidator.USER_NAME_ALREADY_REGISTERED;
/**
 * Copyright Mozilla Public License 1.1
 */

public class UserResourceTest extends RestTest {

    @Inject
    UserRepository userRepository;

    private final String DEFAULT_PASSWORD = "password";


    @Test
    public void can_authenticate_user() throws Exception {
        User rogerLamothe = User.withUsernameAndEmail("roger_lamothe", "roger.lamothe@example.org")
                .password("password");
        userRepository.save(rogerLamothe);
        response = resource.path("users").path("authenticate").queryParam("email", "roger.lamothe@example.org").queryParam("password", "password").get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    @Test
    public void can_logout() throws Exception {
        NewCookie cookie = loginUsingRest().getCookies().get(0);
        assertTrue(usingRestAndCookieIsThereAUserInSession(cookie));
        logoutUsingRestAndCookie(cookie);
        assertFalse(usingRestAndCookieIsThereAUserInSession(cookie));
    }

    private ClientResponse loginUsingRest(){
        User rogerLamothe = User.withUsernameAndEmail("roger_lamothe", "roger.lamothe@example.org")
                .password("password");
        userRepository.save(rogerLamothe);
        ClientResponse response = resource
                .path("users")
                .path("authenticate")
                .queryParam("email", "roger.lamothe@example.org")
                .queryParam("password", "password")
                .get(ClientResponse.class);
        return response;
    }

    private ClientResponse logoutUsingRestAndCookie(NewCookie cookie){
        ClientResponse response = resource
                .path("users")
                .path("logout")
                .cookie(cookie)
                .get(ClientResponse.class);
        return response;
    }

    private boolean usingRestAndCookieIsThereAUserInSession(NewCookie cookie)throws JSONException{
        response = resource
                .path("users")
                .path("is_authenticated")
                .cookie(cookie)
                .get(ClientResponse.class);
        return response.getEntity(JSONObject.class)
                .getBoolean("is_authenticated");

    }

    @Test
    public void authentication_returns_user_as_json() throws Exception {
        User rogerLamothe = User.withUsernameAndEmail("roger_lamothe", "roger.lamothe@example.org")
                .password("password");
        userRepository.save(rogerLamothe);
        response = resource.path("users").path("authenticate").queryParam("email", "roger.lamothe@example.org").queryParam("password", "password").get(ClientResponse.class);
        JSONObject userJson = response.getEntity(JSONObject.class);
        assertThat(userJson.getString(USER_NAME), is("roger_lamothe"));
    }

    @Test
    public void can_create_user() throws Exception {
        JSONObject user = validForCreation();
        assertFalse(userRepository.emailExists(
                user.getString(EMAIL)
        ));
        createUserUsingRest(
                user
        );
        assertTrue(
                userRepository.emailExists(
                        user.getString(EMAIL)
                )
        );
    }

    @Test
    public void creating_a_user_returns_corrects_response()throws Exception{
        JSONObject jsonUser = validForCreation();
        ClientResponse response = createUserUsingRest(
                jsonUser
        );
        assertThat(response.getStatus(), is(201));
        User user = userRepository.findByEmail(
                jsonUser.getString(EMAIL)
        );
        assertThat(
                response.getHeaders().get("Location").get(0),
                is(BASE_URI + "/users/" + user.id())
        );
    }

    @Test
    public void when_creating_a_user_a_mind_map_is_created_for_him() throws Exception {
        JSONObject validUser = validForCreation();
        String username = validUser.getString(USER_NAME);
        assertFalse(
                modelMaker().containsNamedModel(username)
        );
        createUserUsingRest(validUser);
        User user = User.withUsernameAndEmail(
                username, validUser.getString(EMAIL)
        );
        assertTrue(
                modelMaker().containsNamedModel(
                        user.mindMapURIFromSiteURI(TripleBrainUris.BASE)
                )
        );
    }

    private ClientResponse createUserUsingRest(JSONObject user){
        return resource
                .path("users")
                .type("application/json")
                .post(ClientResponse.class, user);
    }

    @Test
    public void can_get_current_authenticated_user()throws Exception{
        User user = createUserWithUsername("roger_lamothe");
        NewCookie cookie = authenticateUser(user);
        response = resource.path("users").cookie(cookie).get(ClientResponse.class);
        JSONObject userFromResponse = response.getEntity(JSONObject.class);
        assertThat(userFromResponse.getString(USER_NAME), is("roger_lamothe"));
    }

    @Test
    public void getting_current_authenticated_user_without_being_authenticated_returns_the_forbidden_status()throws Exception{
        response = resource.path("users").get(ClientResponse.class);
        assertThat(response.getStatus(), is(Response.Status.FORBIDDEN.getStatusCode()));
    }


    @Test
    public void cant_register_same_email_twice() throws Exception {
        createUserWithEmail("roger.lamothe@example.org");
        JSONObject jsonUser = validForCreation().put(EMAIL, "roger.lamothe@example.org");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get("field").toString(), is(EMAIL));
        assertThat(errors.getJSONObject(0).get("reason").toString(), is(ALREADY_REGISTERED_EMAIL));
    }

    @Test
    public void cant_register_same_user_name_twice() throws Exception {
        createUserWithUsername("roger_lamothe");
        JSONObject jsonUser = validForCreation().put(USER_NAME, "roger_lamothe");
        response = resource.path("users").type("application/json").post(ClientResponse.class, jsonUser);
        assertThat(response.getStatus(), is(400));
        JSONArray errors = response.getEntity(JSONArray.class);
        assertThat(errors.length(), greaterThan(0));
        assertThat(errors.getJSONObject(0).get("field").toString(), is(USER_NAME));
        assertThat(errors.getJSONObject(0).get("reason").toString(), is(USER_NAME_ALREADY_REGISTERED));
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
        assertThat(errors.getJSONObject(0).get("field").toString(), is(EMAIL));
        assertThat(errors.getJSONObject(1).get("field").toString(), is(USER_NAME));
        assertThat(errors.getJSONObject(2).get("field").toString(), is(PASSWORD));
    }

    private NewCookie authenticateUser(User user){
        response = resource.path("users").path("authenticate")
                .queryParam("email", user.email())
                .queryParam("password", DEFAULT_PASSWORD)
                .get(ClientResponse.class);
        return response.getCookies().get(0);
    }

    private JSONObject validForCreation() throws Exception{
        JSONObject user = new JSONObject();
        user.put(USER_NAME, randomUsername());
        user.put(EMAIL, randomEmail());
        user.put(PASSWORD, DEFAULT_PASSWORD);
        user.put(PASSWORD_VERIFICATION, DEFAULT_PASSWORD);
        return user;
    }

    private User createUserWithEmail(String email){
        User user = User.withUsernameAndEmail(randomUsername(), email)
                .password(DEFAULT_PASSWORD);
        userRepository.save(user);
        return user;
    }

    private User createUserWithUsername(String username){
        User user = User.withUsernameAndEmail(username, randomEmail())
                .password(DEFAULT_PASSWORD);
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
