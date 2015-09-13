var ResourceLoader = function() {
    this.imagePaths = {
        shotgun: "img/shotgun.png",
        ak47: "img/ak47.png",
        frag: "img/frag.png",
        health: "img/health.png",
        machinegun: "img/machinegun.png",
        pistol: "img/pistol.png",
        pistol2: "img/pistol2.png",
        missile: "img/missilelauncher.png",
        heavygun: "img/heavymachinegun.png",
        kevlar: "img/kevlar.png"
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
