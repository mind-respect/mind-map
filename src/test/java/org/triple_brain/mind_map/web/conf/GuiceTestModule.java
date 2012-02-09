package org.triple_brain.mind_map.web.conf;

import com.google.inject.servlet.ServletModule;
import com.mycila.inject.annotation.OverrideModule;
import com.mycila.inject.internal.guava.collect.ImmutableMap;
import com.ovea.tadjin.util.Application;
import com.ovea.tadjin.util.jersey.GzipEncoder;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;

import javax.inject.Singleton;

/**
 * @author David Avenante
 */
@OverrideModule
public class GuiceTestModule extends ServletModule {

    @Override
    protected void configureServlets() {
        bind(StubResource.class);

        serve("/service/*").with(GuiceContainer.class, com.google.common.collect.ImmutableMap.of(
                "com.sun.jersey.spi.container.ContainerResponseFilters", GzipEncoder.class.getName()
        ));
    }
}