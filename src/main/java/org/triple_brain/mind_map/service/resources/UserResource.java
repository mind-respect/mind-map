package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.module.model.User;
import org.triple_brain.module.repository.user.NonExistingUserException;
import org.triple_brain.module.repository.user.UserRepository;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.util.Map;

import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATED_USER_KEY;
import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATION_ATTRIBUTE_KEY;
import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.isUserInSession;
import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.model.json.UserJSONFields.*;
import static org.triple_brain.module.model.validator.UserValidator.*;
/**
 * Copyright Mozilla Public License 1.1
 */

@Path("/users")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class UserResource {

    @Inject
    UserRepository userRepository;

    @GET
    @Path("/authenticate")
    public Response authenticate(@QueryParam("email") String email, @QueryParam("password") String password, @Context HttpServletRequest request) throws JSONException{
        try {
            User user = userRepository.findByEmail(email);
            if (user.hasPassword(password)) {
                request.getSession().setAttribute(AUTHENTICATION_ATTRIBUTE_KEY, true);
                request.getSession().setAttribute(AUTHENTICATED_USER_KEY, user);
                return Response.ok(user.toJSON()).build();
            }
        } catch (NonExistingUserException e) {
            return Response.status(401).build();
        }
        return Response.status(401).build();
    }

    @GET
    @Path("/")
    public Response sessionUser(@Context HttpServletRequest request) throws JSONException{
        if(isUserInSession(request.getSession())){
            User authenticatedUser = userFromSession(request.getSession());
            return Response.ok(authenticatedUser.toJSON()).build();
        }else{
            return Response.status(Response.Status.FORBIDDEN).build();
        }

    }

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(JSONObject jsonUser, @Context HttpServletRequest request) throws Exception {
        User user = User.withUsernameAndEmail(jsonUser.optString(USER_NAME, ""), jsonUser.optString(EMAIL, ""))
                .password(jsonUser.optString(PASSWORD, ""));

        JSONArray jsonMessages = new JSONArray();
        Map<String, String> errors = validate(jsonUser);

        if (userRepository.emailExists(jsonUser.optString(EMAIL, "")))
            errors.put(EMAIL, ALREADY_REGISTERED_EMAIL);

        if (userRepository.usernameExists(jsonUser.optString(USER_NAME, "")))
            errors.put(USER_NAME, USER_NAME_ALREADY_REGISTERED);

        if (!errors.isEmpty()) {
            for (Map.Entry<String, String> entry : errors.entrySet()) {
                jsonMessages.put(new JSONObject().put(
                        "FIELD", entry.getKey()
                ).put(
                        "REASON", entry.getValue()
                ));
            }

            throw new WebApplicationException(Response
                    .status(BAD_REQUEST)
                    .entity(jsonMessages.toString())
                    .build());
        }

        userRepository.save(user);
        JenaGraphManipulator.createUserGraph(user);
        return Response.created(new URI(request.getRequestURL() + "/" + user.id())).build();
    }

}
