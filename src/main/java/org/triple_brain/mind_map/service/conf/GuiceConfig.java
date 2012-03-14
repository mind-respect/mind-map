package org.triple_brain.mind_map.service.conf;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.matcher.Matchers;
import com.google.inject.servlet.GuiceServletContextListener;
import com.ovea.tadjin.util.properties.JndiPropertySettingsProvider;
import com.ovea.tadjin.util.properties.PropertySettings;
import com.sun.jersey.guice.JerseyServletModule;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;
import org.triple_brain.mind_map.service.SecurityInterceptor;
import org.triple_brain.mind_map.service.resources.*;
import org.triple_brain.module.repository.user.user.UserRepository;
import org.triple_brain.module.repository_sql.SQLUserRepository;

import javax.ws.rs.Path;

/**
 * @author Vincent Blouin
 */
public class GuiceConfig extends GuiceServletContextListener {

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new JerseyServletModule(){
            @Override
            protected void configureServlets() {
                SecurityInterceptor securityInterceptor = new SecurityInterceptor();
                requestInjection(securityInterceptor);

                bindInterceptor(Matchers.any(), Matchers.annotatedWith(Path.class),
                        securityInterceptor);
                PropertySettings settings = new JndiPropertySettingsProvider("settings/global", "settings/application").get();
                bind(PropertySettings.class).toInstance(settings);
                bind(UserRepository.class).to(SQLUserRepository.class);
                bind(DrawnGraphResource.class);
                bind(GraphResource.class);
                bind(VertexResource.class);
                bind(EdgeResource.class);
                bind(UserResource.class);
                serve("/service/*").with(GuiceContainer.class);
                requireBinding(PropertySettings.class);
            }
        });
    }
}
