package org.triple_brain.mind_map.service.conf;

import org.testatoo.config.AbstractTestatooModule;

import static org.testatoo.config.Scope.TEST_SUITE;
import static org.testatoo.container.TestatooContainer.JETTY;

/**
 * @author David Avenante
 */
public class ContainerModule extends AbstractTestatooModule {

    @Override
    protected void configure() {

        if (System.getProperty("port") == null) {
            System.setProperty("port", "" + findFreePort());
        }

        containers().register(createContainer()
                .implementedBy(JETTY)
                .webappRoot("src/main/webapp")
                .port(Integer.parseInt(System.getProperty("port")))
                .build())
                .scope(TEST_SUITE);
    }
}
