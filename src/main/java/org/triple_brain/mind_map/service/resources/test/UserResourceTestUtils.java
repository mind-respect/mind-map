package org.triple_brain.mind_map.service.resources.test;

import org.triple_brain.module.repository.user.UserRepository;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("test/users")
@PermitAll
@Singleton
public class UserResourceTestUtils {

    @Inject
    UserRepository userRepository;

    @Path("{email}")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response emailExists(@PathParam("email") String email)throws Exception{
        return Response.ok(
                userRepository.emailExists(email).toString()
        ).build();
    }

}
