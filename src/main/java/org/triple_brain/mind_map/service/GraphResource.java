package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Statement;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.net.URISyntaxException;

import static org.triple_brain.model.json.StatementJSONFields.*;
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
