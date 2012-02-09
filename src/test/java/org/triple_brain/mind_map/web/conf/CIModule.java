package org.triple_brain.mind_map.web.conf;

import org.testatoo.config.AbstractTestatooModule;
import org.testatoo.config.Scope;
import org.testatoo.config.cartridge.TestatooCartridge;

/**
 * @author David Avenante
 */
public class CIModule extends AbstractTestatooModule {
    @Override
    protected void configure() {

        System.setProperty("host", "10.10.10.30");

        seleniumSessions().register(createSeleniumSession()
            .website("http://" + System.getProperty("host") + ":" + System.getProperty("port"))
            .browser("*firefox")
//            .browser("*googlechrome")
            .serverHost("10.10.10.30") // linux
            //.serverHost("10.10.10.31") // windows
            .serverPort(4444).build())
            .scope(Scope.TEST_SUITE)
            .withTimeout(20000)
            .inCartridge(TestatooCartridge.HTML4);
    }
}