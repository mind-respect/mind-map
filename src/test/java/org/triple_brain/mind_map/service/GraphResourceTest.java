package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.junit.Test;
import org.triple_brain.module.model.TripleBrainUris;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.module.common_utils.Uris.encodeURL;

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
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .cookie(authCookie)
                .get(ClientResponse.class);
    }
}
