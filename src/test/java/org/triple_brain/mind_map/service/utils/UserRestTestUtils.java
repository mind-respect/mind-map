package org.triple_brain.mind_map.service.utils;

import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.codehaus.jettison.json.JSONObject;

import javax.ws.rs.core.MediaType;
import java.util.UUID;

import static org.triple_brain.module.model.json.UserJSONFields.*;

/*
* Copyright Mozilla Public License 1.1
*/
public class UserRestTestUtils {

    private WebResource resource;

    public static UserRestTestUtils withWebResource(WebResource resource){
        return new UserRestTestUtils(resource);
    }

    protected UserRestTestUtils(WebResource resource){
        this.resource = resource;
    }

    public boolean emailExists(String email){
        ClientResponse response = resource
                .path("test")
                .path("users")
                .path(email)
                .accept(MediaType.TEXT_PLAIN)
                .get(ClientResponse.class);
        String emailExistsStr = response.getEntity(String.class);
        return Boolean.valueOf(emailExistsStr);
    }

    public JSONObject validForCreation() throws Exception{
        JSONObject user = new JSONObject();
        user.put(USER_NAME, randomUsername());
        user.put(EMAIL, randomEmail());
        user.put(PASSWORD, RestTest.DEFAULT_PASSWORD);
        user.put(PASSWORD_VERIFICATION, RestTest.DEFAULT_PASSWORD);
        return user;
    }

    private String randomEmail(){
        return UUID.randomUUID().toString() + "@example.org";
    }

    private String randomUsername(){
        return UUID.randomUUID().toString().substring(0, 15);
    }
}
