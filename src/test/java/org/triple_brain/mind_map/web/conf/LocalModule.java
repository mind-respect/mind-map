package org.triple_brain.mind_map.web.conf;

import org.testatoo.config.AbstractTestatooModule;
import org.testatoo.config.Scope;
import org.testatoo.config.cartridge.TestatooCartridge;

/**
 * @author David Avenante
 */
public class LocalModule extends AbstractTestatooModule {

    static int seleniumPort = -1;

    @Override
    protected void configure() {

        System.setProperty("host", "localhost");

        if (seleniumPort == -1) {
            seleniumPort = findFreePort();
        }

        seleniumServers().register(createSeleniumServer()
            .port(seleniumPort)
            .useSingleWindow(true)
            .build())
            .scope(Scope.TEST_SUITE);

        seleniumSessions().register(createSeleniumSession()
            .website("http://" + System.getProperty("host") + ":" + System.getProperty("port"))
                .browser("*firefox")
//            .browser("*googlechrome")
            .serverHost("localhost")
            .serverPort(seleniumPort).build())
            .scope(Scope.TEST_SUITE)
            .withTimeout(20000)
            .inCartridge(TestatooCartridge.HTML4);
    }
}
