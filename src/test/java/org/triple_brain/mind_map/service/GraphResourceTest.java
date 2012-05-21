package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.graphmanipulator.jena.TripleBrainModel.*;

/**
 * Copyright Mozilla Public License 1.1
 */

public class GraphResourceTest extends GraphManipulationRestTest {

    @Test
    public void can_get_graph_as_xml_rdf()throws Exception{
        ClientResponse response = getGraphAsXMLRDFUsingRest();
        String rdfXMLGraph = response.getEntity(String.class);
        assertThat(rdfXMLGraph, is(not(nullValue())));
    }

    @Test
    public void getting_graph_as_xml_rdf_returns_correct_response_status()throws Exception{
        ClientResponse response = getGraphAsXMLRDFUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse getGraphAsXMLRDFUsingRest()throws Exception{
        return  resource
                .path("graph")
                .path(ServiceUtils.encodeURL(authenticatedUser.mindMapURIFromSiteURI(SITE_URI)))
                .cookie(authCookie)
                .get(ClientResponse.class);
    }
}
