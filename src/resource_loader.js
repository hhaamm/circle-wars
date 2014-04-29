var ResourceLoader = function() {
    this.imagePaths = {
        shotgun: "img/shotgun.png"
    };
    this.images = {};
    this.imagesLoaded = 0;

    this.loadResources = function(callback)
    {
        debug("Loading");
                
        var _self = this;

        for (var key in this.imagePaths) {
            var path = this.imagePaths[key];
            debug("loading "+path);

            var img = new Image();
            img.addEventListener("load", function() {
                _self.imagesLoaded += 1;
                debug("loaded "+path);
                if (_self.imagesLoaded == Object.keys(_self.imagePaths).length) {
                    debug("All resources loaded");
                    callback.call({success: true});
                }
            });
            img.addEventListener("error", function(e) {
                debug("Error when loading resource " + path);
                debug(e);
                callback.call({success: false, error: e});
            });
            img.src = path;
            this.images[key] = img;
        }
    };
};
