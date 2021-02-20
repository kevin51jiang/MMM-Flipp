const NodeHelper = require("node_helper");
const got = require("got");

const allSettled = require("promise.allsettled");
const deepEqual = require("deep-equal");
const firebase = require("firebase");
require("firebase/firestore");

//  https://gateflipp.flippback.com/bf/flipp/items/search?locale=en-ca&postal_code=N1L0A2&sid=&q=rooodab
const getFlippItems = async (searchTerm, postalCode) => {
  return await got(
    `https://gateflipp.flippback.com/bf/flipp/items/search?locale=en-ca&postal_code=${encodeURIComponent(
      postalCode
    )}&sid=&q=${encodeURIComponent(searchTerm)}`
  );
};

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notif, payload) {
    var self = this;
    console.log(
      "Helper got request: " +
        notif +
        " with payload " +
        JSON.stringify(payload)
    );
    if (notif === "GET_INFO") {
      const { searchTerm, postalCode, limit } = payload;

      // this.sendSocketNotification("test2", { message: "test2" });
      getFlippItems(searchTerm, postalCode).then((res) => {
        // console.log("res", res?.body);

        const jsonRes = JSON.parse(res.body || "{}");

        if (jsonRes?.items) {
          this.sendSocketNotification("RETURN_INFO", {
            productInfo: jsonRes?.items.slice(0, limit)
          });
        } else {
          this.sendSocketNotification("RETURN_INFO", {
            productInfo: {}
          });
        }
      });
    }
  }
});
