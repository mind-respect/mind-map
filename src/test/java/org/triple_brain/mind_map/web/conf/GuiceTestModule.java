package org.triple_brain.mind_map.web.conf;

import com.sun.jersey.guice.JerseyServletModule;
/**
 * @author David Avenante
 */
//@OverrideModule
public class GuiceTestModule extends JerseyServletModule{

//    @Override
//    protected void configureServlets() {
//        bind(StubResource.class);
//
//        serve("/service/*").with(GuiceContainer.class, com.google.common.collect.ImmutableMap.of(
//                "com.sun.jersey.spi.container.ContainerResponseFilters", GzipEncoder.class.getName()
//        ));
//    }
}