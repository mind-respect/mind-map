package org.triple_brain.mind_map.service;

import com.google.inject.AbstractModule;
import com.ovea.tadjin.util.properties.PropertySettings;
import org.triple_brain.mind_map.service.resources.*;

import java.util.logging.Logger;

/**
 * @author David Avenante
 */
public class RestModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(DrawnGraphResource.class);
        bind(GraphResource.class);
        bind(VertexResource.class);
        bind(EdgeResource.class);
        bind(UserResource.class);
        requireBinding(PropertySettings.class);
    }
}
