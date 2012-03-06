package org.triple_brain.mind_map.web;

import com.sun.jersey.guice.JerseyServletModule;

/**
 * @author Vincent Blouin
 */
public class WebModule extends JerseyServletModule {

    @Override
    protected void configureServlets() {
//        bind(Context.class).to(InitialContext.class).in(Singleton.class);
//
//        PropertySettings settings = new JndiPropertySettingsProvider("settings/global", "settings/application").get();
//        bind(PropertySettings.class).toInstance(settings);
//
//        bind(UserRepository.class).to(SQLUserRepository.class);
//
//        serve("/service/*").with(GuiceContainer.class, com.google.common.collect.ImmutableMap.of(
//                "com.sun.jersey.spi.container.ContainerResponseFilters", GzipEncoder.class.getName()
//        ));
    }
}
