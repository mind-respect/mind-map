if (window.TabPanel == undefined) {

    TabPanel = function(tabsSelector, panelSelector, transition) {

        var self = this;
        var _transition = transition;
        this.tabs = $(tabsSelector).find("li");
        this.tabContainers = $(panelSelector).children('div');

        this.tabs.find('a').removeClass('current').filter(':first').addClass('current');
        this.tabContainers.hide().filter(':first').show();

        this.tabs.click(function(event) {

            if($(':animated').length) {
                return false;
            }

            var oldTabIndex = self.selected();
            self.tabs.find('a').removeClass('current');
            $(this).find('a').addClass('current');
            var newTabIndex = self.selected();

            if (_transition) {
                $(self.tabContainers.get(oldTabIndex)).fadeOut(400, function () {
                    $(self.tabContainers.get(newTabIndex)).fadeIn(400);
                });
            } else {
                self.tabContainers.hide();
                $(self.tabContainers.get(newTabIndex)).show();
            }
        });
    };

    TabPanel.prototype = {
        select: function(index) {
            this.tabContainers.hide();
            this.tabs.find('a').removeClass('current');

            $(this.tabs.get(index)).find('a').addClass('current');
            $(this.tabContainers.get(index)).show();
        },
        selected: function() {
            return this.tabs.index(this.tabs.parent().find('li').has('a.current'));
        }
    }
}