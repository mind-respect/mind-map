package org.triple_brain.mind_map.service;

import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.*;
import org.triple_brain.module.model.json.ExternalResourceJson;

import javax.inject.Inject;
import java.util.Observable;
import java.util.Observer;
import java.util.Set;

/*
* Copyright Mozilla Public License 1.1
*/
public class ExternalResourceServiceUtils {
    @Inject
    BeforeAfterEachRestCall beforeAfterEachRestCall;

    @Inject
    ExternalFriendlyResourcePersistenceUtils friendlyResourcePersistor;

    public Observer imagesUpdateHandler = new Observer() {
        @Override
        public void update(Observable observable, Object o) {
            FreebaseExternalFriendlyResource freebaseExternalFriendlyResource = (FreebaseExternalFriendlyResource) observable;
            ExternalFriendlyResource externalResource = freebaseExternalFriendlyResource.get();
            Set<Image> images = (Set<Image>) o;
            Object state = beforeAfterEachRestCall.before();
            try {
                friendlyResourcePersistor.addImages(
                        externalResource,
                        images
                );
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            finally{
                beforeAfterEachRestCall.after(state);
            }
            BayeuxInitializer.notificationService.notifyChannelMessage(
                    "/identification/" +
                            Uris.encodeURL(externalResource.uri()) +
                            "/updated",
                    ExternalResourceJson.get(
                            friendlyResourcePersistor.getUpdated(
                                    externalResource
                            )
                    )
            );
        }
    };

    public Observer descriptionUpdateHandler = new Observer() {
        @Override
        public void update(Observable observable, Object o) {
            FreebaseExternalFriendlyResource freebaseExternalFriendlyResource = (FreebaseExternalFriendlyResource) observable;
            ExternalFriendlyResource externalResource = freebaseExternalFriendlyResource.get();
            String description = (String) o;
            Object state = beforeAfterEachRestCall.before();
            try {
                friendlyResourcePersistor.setDescription(
                        externalResource,
                        description
                );
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            finally{
                beforeAfterEachRestCall.after(state);
            }
            BayeuxInitializer.notificationService.notifyChannelMessage(
                    "/identification/" +
                            Uris.encodeURL(externalResource.uri()) +
                            "/updated",
                    ExternalResourceJson.get(
                            friendlyResourcePersistor.getUpdated(
                                    externalResource
                            )
                    )
            );
        }
    };



}
