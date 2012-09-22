package org.triple_brain.mind_map.service.resources;

import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.GraphElementIdentifier;
import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.repository.user.UserRepository;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;

import static org.triple_brain.mind_map.service.ServiceUtils.usernameInURI;

/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class GraphResource {

    @Inject
    UserRepository userRepository;

    @Inject
    GraphFactory graphFactory;

    @GET
    @Path("{graph_uri}")
    @Produces(MediaType.APPLICATION_XML)
    public Response rdfXML(@GraphElementIdentifier @PathParam("graph_uri") String graphUri){
        User user = userRepository.findByUsername(usernameInURI(URI.create(graphUri)));
        UserGraph userGraph = graphFactory.loadForUser(
                user
        );
        return Response.ok(userGraph.toRdfXml()).build();
    }
}
