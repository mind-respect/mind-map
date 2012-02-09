package org.triple_brain.mind_map.web.conf;

import org.testatoo.config.AbstractTestatooModule;

/**
 * @author David Avenante
 */
public class Module extends AbstractTestatooModule {

    @Override
    protected void configure() {
        if (System.getProperty("port") == null) {
            System.setProperty("port", "" + findFreePort());
        }

        install(System.getProperty("CI") == null ? new LocalModule() : new CIModule());

        install(new ContainerModule());

        useAnnotations();
    }

}