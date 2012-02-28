package org.triple_brain.mind_map.service.resources;

import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static org.triple_brain.mind_map.service.SingleUserTempClass.*;

/**
 * @author Vincent Blouin
 */
@Path("/graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class GraphResource {

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_XML)
    public Response rdfXML(){
        return Response.ok(jenaGraphManipulator.toRDFXML()).build();
    }

}
