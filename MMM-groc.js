var persistentThis;

Module.register("MMM-groc", {
  defaults: {
    updateInterval: 1000 * 60 * 10,
    // renderInterval: 1000 * 60 * 10,
    // updateInterval: 1000 * 5,
    renderInterval: 1000 * 5,
    postalCode: "N1L0A2",
    watching: ["lettuce", "tomato", "cheese"],
    index: 0
  },

  getStyles: function () {
    return [this.file("MMM-groc.css"), "font-awesome.css"];
  },

  start: function () {
    persistentThis = this;
    Log.log("Starting module: " + this.name);

    this.updateInterval = this.config.updateInterval;
    this.renderInterval = this.config.renderInterval;
    this.postalCode = this.config.postalCode;
    persistentThis.watching = persistentThis.config.watching;
    persistentThis.index = persistentThis.config.index;

    this.updateData = async () => {
      Log.info("persistentThis.index;", persistentThis.index);
      console.log("update this", this);
      persistentThis.index++;
      persistentThis.index %= persistentThis.watching.length;
      Log.info(
        "going for watching of",
        persistentThis.config.watching[persistentThis.config.index]
      );
      persistentThis.sendSocketNotification("GET_INFO", {
        searchTerm: this.config.watching[this.config.index],
        postalCode: this.config.postalCode,
        limit: 8
      });
    };

    // firebase.initializeApp(firebaseConfig);
    // firebase.analytics();
    this.updateCycle();
    this.saleData = [];
    setInterval(this.updateCycle, this.config.updateInterval);
    setInterval(() => this.updateDom(), this.config.renderInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("socketNotificationReceived() in main module.." + notification);
    if (notification === "RETURN_INFO") {
      console.log("payload.productInfo;", payload.productInfo);
      this.saleData = payload.productInfo;
      console.log("this.saleData right after notif", this.saleData);
      console.log("trying to update dom");
      persistentThis.updateDom();
    }
  },

  updateCycle: async function () {
    // this.saleData = [];
    Log.info("this.updateData", Object.keys(this));
    window = { ...window, ...this };
    // await this.updateData();
    await persistentThis.updateData();
    persistentThis.updateDom();
  },

  getHeader: () => {
    return "groc";
  },

  getDom: function () {
    var self = this;
    Log.info("getting new DOM thingy");
    let table = document.createElement("table");
    table.classList.add("groc");

    console.log("saleData", this.saleData);

    this.saleData
      .filter(
        (product) =>
          product.name && product.current_price && product.merchant_name
      )
      .forEach((product) => {
        Log.info("processing product: ", product);
        let basicRow = document.createElement("tr");
        basicRow.style.paddingBottom = "0.25em";

        let title = document.createElement("td");
        title.innerText = product.name;
        title.style.textOverflow = "ellipses";
        title.style.maxWidth = "50%";

        let price = document.createElement("td");
        price.innerHTML = `<i class="fa fa-dollar-sign"></i> ${product.current_price}`;
        price.style.textAlign = "left";

        let location = document.createElement("td");
        location.innerHTML = `<i class="fa fa-store"></i> ${product.merchant_name}`;
        location.style.textAlign = "left";
        location.style.width = "min-content";

        basicRow.append(title);
        basicRow.append(price);
        basicRow.append(location);
        Log.info("basic row", basicRow);
        table.append(basicRow);
      });

    // table.innerHTML =
    //   '<img src="http://images.wishabi.net/merchants/2596/1507754046/storefront_logo" > </img>';

    Log.info("Final loggy log log ", table);
    return table;
  }
});
