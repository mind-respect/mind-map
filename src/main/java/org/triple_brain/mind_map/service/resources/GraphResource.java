package org.triple_brain.mind_map.service.resources;

import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class GraphResource {

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_XML)
    public Response rdfXML(@Context HttpServletRequest request){
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        return Response.ok(graphManipulator.toRDFXML()).build();
    }
}
