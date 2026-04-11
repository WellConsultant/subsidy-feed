import {
  init_modal_sidebar_v1
} from "./chunk-XEWIS3EZ.js";
import {
  init_text_area_v1
} from "./chunk-XIUAOK6S.js";
import {
  init_survey_image_option_v1
} from "./chunk-KNWJ4RWG.js";
import {
  init_select_box_v2
} from "./chunk-HGEWLBI7.js";
import {
  Fetcher,
  MANUALLY_ABORTED,
  fetcher_exports,
  init_fetcher
} from "./chunk-FMVGAALE.js";
import {
  init_addToCart,
  mountComponent
} from "./chunk-3OY2N4PI.js";
import {
  debounce,
  init_general,
  init_nanostores,
  nanostores_exports
} from "./chunk-6UN4N47C.js";
import {
  init_checkbox_v1,
  init_radio_v1
} from "./chunk-73EB6NH7.js";
import {
  init_input_v1
} from "./chunk-3OTUYMNA.js";
import {
  init_cf_utils,
  isWithinCustomerCenterView
} from "./chunk-M4JGSF3Y.js";
import {
  init_modal_v1
} from "./chunk-YNQPYXFA.js";
import {
  CF2Component,
  init_runtime,
  registerComponent,
  runtime_exports
} from "./chunk-IF35HPMH.js";
import {
  __commonJS,
  __esm,
  __export,
  __toCommonJS,
  init_define_process
} from "./chunk-XDBWEWVZ.js";

// projects/user_pages/app/javascript/lander/utils/replace_tag.js
var require_replace_tag = __commonJS({
  "projects/user_pages/app/javascript/lander/utils/replace_tag.js"() {
    init_define_process();
    (function($4) {
      $4.fn.changeElementType = function(newType) {
        var attrs = {};
        $4.each(this[0].attributes, function(idx, attr) {
          attrs[attr.nodeName] = attr.nodeValue;
        });
        this.replaceWith(function() {
          return $4("<" + newType + "/>", attrs).append($4(this).contents());
        });
      };
    })(jQuery);
  }
});

// projects/shared/javascript/parseurl.js
var require_parseurl = __commonJS({
  "projects/shared/javascript/parseurl.js"() {
    init_define_process();
    (function($4) {
      var re = /([^&=]+)=?([^&]*)/g;
      var decode = function(str) {
        return decodeURIComponent(str.replace(/\+/g, " "));
      };
      $4.parseParams = function(query) {
        function createElement(params2, key2, value2) {
          key2 = key2 + "";
          if (key2.indexOf(".") !== -1) {
            var list = key2.split(".");
            var new_key = key2.split(/\.(.+)?/)[1];
            if (!params2[list[0]]) params2[list[0]] = {};
            if (new_key !== "") {
              createElement(params2[list[0]], new_key, value2);
            } else console.warn('parseParams :: empty property in key "' + key2 + '"');
          } else if (key2.indexOf("[") !== -1) {
            var list = key2.split("[");
            key2 = list[0];
            var list = list[1].split("]");
            var index = list[0];
            if (index == "") {
              if (!params2) params2 = {};
              if (!params2[key2] || !$4.isArray(params2[key2])) params2[key2] = [];
              params2[key2].push(value2);
            } else {
              if (!params2) params2 = {};
              if (!params2[key2] || !$4.isArray(params2[key2])) params2[key2] = [];
              params2[key2][parseInt(index)] = value2;
            }
          } else {
            if (!params2) params2 = {};
            params2[key2] = value2;
          }
        }
        query = query + "";
        if (query === "") query = window.location + "";
        var params = {}, e;
        if (query) {
          if (query.indexOf("#") !== -1) {
            query = query.substr(0, query.indexOf("#"));
          }
          if (query.indexOf("?") !== -1) {
            query = query.substr(query.indexOf("?") + 1, query.length);
          } else return {};
          if (query == "") return {};
          while (e = re.exec(query)) {
            var key = decode(e[1]);
            var value = decode(e[2]);
            createElement(params, key, value);
          }
        }
        return params;
      };
    })(jQuery);
  }
});

// projects/user_pages/app/javascript/lander/audio_player.ts
var require_audio_player = __commonJS({
  "projects/user_pages/app/javascript/lander/audio_player.ts"() {
    init_define_process();
    var CFbuildAudioPlayer = function(el) {
      try {
        el.each(function() {
          const $this = $(this);
          const audioURL = $this.attr("data-audio-url") || "https://images.clickfunnels.com/images/SevenNationArmy.mp3";
          const loop = $this.attr("data-audio-loop") || "no";
          const playerOptions = {
            class: "elAudioElement",
            audioWidth: "100%",
            audioHeight: "100%",
            enableAutosize: true,
            enableProgressTooltip: false,
            loop: loop === "yes",
            features: ["playpause", "current", "progress", "duration", "volume"]
          };
          const audio = $(this).find("audio");
          audio.attr("src", audioURL);
          audio.mediaelementplayer(playerOptions);
        });
      } catch (err) {
        console.log(err);
      }
    };
    window.addEventListener("load", function() {
      CFbuildAudioPlayer($(".pageRoot .elAudioWrapper"));
    });
  }
});

// projects/user_pages/app/javascript/lander/vendor/garlic.cf.js
var require_garlic_cf = __commonJS({
  "projects/user_pages/app/javascript/lander/vendor/garlic.cf.js"() {
    init_define_process();
    globalThis.CFGarlicValues = {};
    !function($4) {
      "use strict";
      class Storage {
        constructor() {
          this.defined = "undefined" !== typeof localStorage;
        }
        get(key, placeholder) {
          return localStorage.getItem(key) ? localStorage.getItem(key) : "undefined" !== typeof placeholder ? placeholder : null;
        }
        has(key) {
          return localStorage.getItem(key) ? true : false;
        }
        set(key, value, fn) {
          if ("string" === typeof value) {
            if ("" === value) {
              this.destroy(key);
            } else {
              localStorage.setItem(key, value);
            }
          }
          return "function" === typeof fn ? fn() : true;
        }
        destroy(key, fn) {
          localStorage.removeItem(key);
          return "function" === typeof fn ? fn() : true;
        }
      }
      window.cfGarlicUtils = {
        buildKey: (name) => {
          return `garlic::${document.domain}*:${name}`;
        },
        retrieve: (name) => {
          if (window.CF2_DISABLE_GARLIC) return;
          const storage = new Storage();
          const key = window.cfGarlicUtils.buildKey(name);
          return storage.get(key);
        },
        store: (name, value) => {
          if (window.CF2_DISABLE_GARLIC) return;
          const storage = new Storage();
          const key = window.cfGarlicUtils.buildKey(name);
          return storage.set(key, value);
        }
      };
      var Garlic = function(element, storage, options) {
        this.init("garlic", element, storage, options);
      };
      Garlic.prototype = {
        constructor: Garlic,
        /* init data, bind jQuery on() actions */
        init: function(type, element, storage, options) {
          this.type = type;
          this.$element = $4(element);
          this.options = this.getOptions(options);
          this.storage = storage;
          this.path = this.getPath();
          this.$element.addClass("garlic-auto-save");
          this.$element.on(this.options.events.join("." + this.type + " "), false, $4.proxy(this.persist, this));
          this.retrieve();
        },
        getOptions: function(options) {
          return $4.extend({}, $4.fn[this.type].defaults, options, this.$element.data());
        },
        /* temporary store data / state in localStorage */
        persist: function() {
          if (window.CF2_DISABLE_GARLIC) return;
          if (this.val === this.getVal()) {
            return;
          }
          this.val = this.getVal();
          this.storage.set(this.path, this.getVal());
          this.options.onPersist(this.$element, this.getVal());
        },
        getVal: function() {
          return !this.$element.is("input[type=checkbox]") ? this.$element.val() : this.$element.prop("checked") ? "checked" : "unchecked";
        },
        /* retrieve localStorage data / state and update elem accordingly */
        retrieve: function() {
          if (window.CF2_DISABLE_GARLIC) return;
          if (this.storage.has(this.path)) {
            var storedValue = this.storage.get(this.path);
            if (this.$element.is("input[type=radio], input[type=checkbox]")) {
              if ("checked" === storedValue || this.$element.val() === storedValue) {
                return this.$element.attr("checked", true);
              } else if ("unchecked" === storedValue) {
                this.$element.attr("checked", false);
              }
              return;
            }
            this.$element.val(storedValue);
            this.$element.trigger("input");
            this.options.onRetrieve(this.$element, storedValue);
            return;
          }
        },
        /* delete localStorage persistance only */
        destroy: function() {
          if (window.CF2_DISABLE_GARLIC) return;
          this.storage.destroy(this.path);
        },
        getPath: function(elem) {
          if ("undefined" === typeof elem) {
            elem = this.$element;
          }
          if (elem.length != 1) {
            return false;
          }
          const node = elem.length ? elem[0] : elem;
          const name = node.getAttribute("name");
          return window.cfGarlicUtils.buildKey(name);
        },
        getStorage: function() {
          return this.storage;
        }
      };
      $4.fn.garlic = function(option, fn) {
        const options = $4.extend(true, {}, $4.fn.garlic.defaults, option, this.data());
        const storage = new Storage();
        if (!storage.defined) {
          return false;
        }
        function bind(self) {
          var $this = $4(self), data = $this.data("garlic"), fieldOptions = $4.extend({}, options, $this.data());
          if ("undefined" !== typeof fieldOptions.storage && !fieldOptions.storage) {
            return;
          }
          if ("password" === $4(self).attr("type")) {
            return;
          }
          if (!data) {
            $this.data("garlic", data = new Garlic(self, storage, fieldOptions));
          }
          if ("string" === typeof option && "function" === typeof data[option]) {
            return data[option]();
          }
        }
        const returnValue = bind($4(this));
        return "function" === typeof fn ? fn() : returnValue;
      };
      $4.fn.garlic.Constructor = Garlic;
      $4.fn.garlic.defaults = {
        events: ["DOMAttrModified", "textInput", "input", "change", "click", "keypress", "paste", "focus"],
        // Events list that trigger a localStorage
        onRetrieve: function() {
        },
        // This function will be triggered each time Garlic find an retrieve a local stored data for a field
        onPersist: function() {
        }
        // This function will be triggered each time Garlic stores a field to local storage
      };
    }(window.jQuery || window.Zepto);
  }
});

// projects/user_pages/app/javascript/lander/populate_select.ts
var populate_select_exports = {};
__export(populate_select_exports, {
  populateSelect: () => populateSelect
});
var populateSelect;
var init_populate_select = __esm({
  "projects/user_pages/app/javascript/lander/populate_select.ts"() {
    init_define_process();
    globalThis.ClickFunnels = globalThis.ClickFunnels ?? {};
    populateSelect = (selectElement, type = void 0) => {
      type = type ?? $(selectElement).parents(".elSelectWrapper").attr("data-type");
      let items;
      const allCountries = globalThis.ClickFunnels.all_countries;
      if (type == "all_united_states") {
        selectElement.innerHTML = "<option> Select State </option>";
        items = allCountries.find((c) => c.iso2 == "US")?.regions;
        items.forEach((item) => selectElement.innerHTML += `<option value="${item.state_code}" > ${item.name} </option>`);
      } else if (type == "all_canadian_provinces") {
        selectElement.innerHTML = "<option> Select State </option>";
        items = allCountries.find((c) => c.iso2 == "CA")?.regions;
        items.forEach((item) => selectElement.innerHTML += `<option value="${item.state_code}" > ${item.name} </option>`);
      } else if (type == "all_countries") {
        const topMapping = ["US", "CA", "GB", "IE", "AU", "NZ"];
        const topHash = topMapping.reduce((acc, val) => {
          acc[val] = true;
          return acc;
        }, {});
        const topOptions = topMapping.map((iso2) => ({ iso2 }));
        const remainingOptions = [];
        allCountries.forEach((item) => {
          if (topHash[item.iso2]) {
            const option = topOptions.find((option2) => option2.iso2 == item.iso2);
            option.name = item.name;
          } else {
            remainingOptions.push(item);
          }
        });
        let html = "";
        topOptions.forEach((item) => html += `<option value="${item.iso2}" > ${item.name} </option>`);
        remainingOptions.forEach((item) => html += `<option value="${item.iso2}" > ${item.name} </option>`);
        selectElement.innerHTML = html;
      }
    };
    globalThis.ClickFunnels.populateSelect = populateSelect;
    window.addEventListener("load", function() {
      if (!$(".elCheckout, .elSelect, .elSuperSelect").length) return;
      if ($('[data-page-element="Checkout/V2"]').length) return;
      $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/cf_countries_states"
      }).then((data) => {
        globalThis.ClickFunnels.all_countries = data.result;
        window.dispatchEvent(new CustomEvent("CF2_COUNTRIES_FETCHED"));
        $(".elSelect, .elSuperSelect").each((index, element) => {
          populateSelect(element);
        });
      });
    });
  }
});

// projects/user_pages/app/javascript/lander/runtime_events.ts
var require_runtime_events = __commonJS({
  "projects/user_pages/app/javascript/lander/runtime_events.ts"() {
    init_define_process();
    var CFEvents2 = /* @__PURE__ */ ((CFEvents3) => {
      CFEvents3["FORM_SUBMITTED"] = "cf:form_submitted";
      CFEvents3["FORM_SUBMITTED_OK"] = "cf:form_submitted:ok";
      CFEvents3["FORM_SUBMITTED_FINALIZED"] = "cf:form_submitted:finalized";
      return CFEvents3;
    })(CFEvents2 || {});
    globalThis.CFEvents = CFEvents2;
    globalThis.CFDispatchEvent = function(eventName, detail) {
      const event = new CustomEvent(eventName, { detail });
      document.dispatchEvent(event);
    };
  }
});

// projects/user_pages/app/javascript/lander/fhl_handle_select_transformation.ts
var fhl_handle_select_transformation_exports = {};
var init_fhl_handle_select_transformation = __esm({
  "projects/user_pages/app/javascript/lander/fhl_handle_select_transformation.ts"() {
    init_define_process();
    init_populate_select();
    window.addEventListener("CF2_COUNTRIES_FETCHED", function() {
      const $allCountrySelects = $(".elSelectWrapper[data-type='all_countries'] .elSelect[name='country']");
      const $allStateInputs = $(".elInput[name='state']");
      let $allStates = $(".elSelect[name='state']");
      if ($allCountrySelects.length && $allStates.length && !$allStateInputs.length) {
        $allCountrySelects.on("change", function() {
          const $select = $(this);
          const val = $select.val();
          $allStates = $(".elSelect[name='state']");
          if (val != "US") {
            $allStates.html("");
            $allStates.val("");
            $allStates.changeElementType("input");
            $allStates = $(".elSelect[name='state']");
            $allStates.attr("placeholder", "Shipping State");
          } else {
            $allStates.val("");
            $allStates.changeElementType("select");
            $allStates = $(".elSelect[name='state']");
            $allStates.each((index, element) => populateSelect(element));
          }
        });
        $allCountrySelects.trigger("change");
      }
    });
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/rng.js
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
var getRandomValues, rnds8;
var init_rng = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/rng.js"() {
    init_define_process();
    rnds8 = new Uint8Array(16);
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/regex.js"() {
    init_define_process();
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/validate.js"() {
    init_define_process();
    init_regex();
    validate_default = validate;
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/stringify.js
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, i, stringify_default;
var init_stringify = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/stringify.js"() {
    init_define_process();
    init_validate();
    byteToHex = [];
    for (i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/v4.js"() {
    init_define_process();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/index.js
var init_esm_browser = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/node_modules/uuid/dist/esm-browser/index.js"() {
    init_define_process();
    init_v4();
  }
});

// node_modules/@clickfunnels2/cfhoy.js/dist/cfhoy.esm.js
function visitsUrl() {
  return config.urlPrefix + config.visitsUrl + "/" + ahoy.getVisitId();
}
function eventsUrl() {
  return config.urlPrefix + config.eventsUrl;
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
function canTrackNow() {
  return (config.useBeacon || config.trackNow) && isEmpty(config.headers) && canStringify && typeof window.navigator.sendBeacon !== "undefined" && !config.withCredentials;
}
function serialize(object) {
  var data = new FormData();
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      data.append(key, object[key]);
    }
  }
  return data;
}
function setCookie(name, value, ttl) {
  Cookies.set(name, value, ttl, config.cookieDomain || config.domain);
}
function getCookie(name) {
  return Cookies.get(name);
}
function destroyCookie(name) {
  Cookies.set(name, "", -1);
}
function getFbclid() {
  var fbclidQueryString = QueryString.get("fbclid");
  if (fbclidQueryString) {
    return fbclidQueryString;
  } else {
    var fbcCookie = getCookie("_fbc");
    if (fbcCookie) {
      var fbclid = fbcCookie.slice(19);
      return fbclid;
    } else {
      return null;
    }
  }
}
function getG4ClientId() {
  var g4Cookie = getCookie("_ga");
  if (g4Cookie) {
    var g4ClientId = g4Cookie.slice(6);
    return g4ClientId;
  } else {
    return null;
  }
}
function log(message) {
  if (getCookie("cfhoy_debug")) {
    window.console.log(message);
  }
}
function setReady() {
  var callback;
  while (callback = queue.shift()) {
    callback();
  }
  isReady = true;
}
function matchesSelector(element, selector) {
  var matches = element.matches || element.matchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector;
  if (matches) {
    if (matches.apply(element, [selector])) {
      return element;
    } else if (element.parentElement) {
      return matchesSelector(element.parentElement, selector);
    }
    return null;
  } else {
    log("Unable to match");
    return null;
  }
}
function onEvent(eventName, selector, callback) {
  document.addEventListener(eventName, function(e) {
    var matchedElement = matchesSelector(e.target, selector);
    if (matchedElement) {
      callback.call(matchedElement, e);
    }
  });
}
function documentReady(callback) {
  if (document.readyState === "interactive" || document.readyState === "complete") {
    setTimeout(callback, 0);
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}
function generateId(key) {
  if (key === void 0) key = null;
  if (key) {
    if (idCache[key]) {
      return idCache[key];
    } else {
      var newId = v4_default();
      idCache[key] = newId;
      return newId;
    }
  }
  return v4_default();
}
function saveEventQueue() {
  if (config.cookies && canStringify) {
    setCookie("cfhoy_events", JSON.stringify(eventQueue), 1);
  }
}
function csrfToken() {
  var meta = document.querySelector("meta[name=csrf-token]");
  return meta && meta.content;
}
function csrfParam() {
  var meta = document.querySelector("meta[name=csrf-param]");
  return meta && meta.content;
}
function CSRFProtection(xhr) {
  var token = csrfToken();
  if (token) {
    xhr.setRequestHeader("X-CSRF-Token", token);
  }
}
function sendRequest(url, data, success) {
  if (canStringify) {
    if ($2 && $2.ajax) {
      $2.ajax({
        type: "POST",
        url,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: CSRFProtection,
        success,
        headers: config.headers,
        xhrFields: {
          withCredentials: config.withCredentials
        }
      });
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.withCredentials = config.withCredentials;
      xhr.setRequestHeader("Content-Type", "application/json");
      for (var header in config.headers) {
        if (config.headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, config.headers[header]);
        }
      }
      xhr.onload = function() {
        if (xhr.status >= 200 || xhr.status <= 399) {
          success(null, null, xhr);
        }
      };
      CSRFProtection(xhr);
      xhr.send(JSON.stringify(data));
    }
  }
}
function eventData(event) {
  var data = {
    events: [event]
  };
  if (config.cookies) {
    data.visit_token = event.visit_token;
    data.visitor_token = event.visitor_token;
  }
  delete event.visit_token;
  delete event.visitor_token;
  return data;
}
function trackEvent(event) {
  ahoy.ready(function() {
    sendRequest(eventsUrl(), eventData(event), function() {
      for (var i = 0; i < eventQueue.length; i++) {
        if (eventQueue[i].id == event.id) {
          eventQueue.splice(i, 1);
          break;
        }
      }
      saveEventQueue();
    });
  });
}
function trackEventNow(event) {
  ahoy.ready(function() {
    var data = eventData(event);
    var param = csrfParam();
    var token = csrfToken();
    if (param && token) {
      data[param] = token;
    }
    data.events_json = JSON.stringify(data.events);
    delete data.events;
    window.navigator.sendBeacon(eventsUrl(), serialize(data));
  });
}
function page() {
  return config.page || window.location.pathname;
}
function presence(str) {
  return str && str.length > 0 ? str : null;
}
function cleanObject(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null) {
        delete obj[key];
      }
    }
  }
  return obj;
}
function eventProperties() {
  return cleanObject({
    tag: this.tagName.toLowerCase(),
    id: presence(this.id),
    "class": presence(this.className),
    page: page(),
    section: getClosestSection(this)
  });
}
function getClosestSection(element) {
  for (; element && element !== document; element = element.parentNode) {
    if (element.hasAttribute("data-section")) {
      return element.getAttribute("data-section");
    }
  }
  return null;
}
function createVisit() {
  if (visitTrackedThisRequest) {
    return;
  }
  isReady = false;
  visitId = ahoy.getVisitId();
  visitorId = ahoy.getVisitorId();
  track = getCookie("cfhoy_track");
  var successful_visit_track = getCookie("cfhoy_successful_visit_track") === visitId;
  if (config.cookies === false || config.trackVisits === false) {
    log("Visit tracking disabled");
    setReady();
  } else if (visitId && visitorId && successful_visit_track && !track) {
    log("Active visit");
    setReady();
  } else {
    if (!visitId) {
      visitId = generateId();
      setCookie("cfhoy_visit", visitId, config.visitDuration);
    }
    if (getCookie("cfhoy_visit")) {
      log("Visit started");
      if (!visitorId) {
        visitorId = generateId();
        setCookie("cfhoy_visitor", visitorId, config.visitorDuration);
      }
      var fbclid = getFbclid();
      var fbc = getCookie("_fbc");
      var fbp = getCookie("_fbp");
      var g4_client_id = getG4ClientId();
      var data = {
        visit_token: visitId,
        visitor_token: visitorId,
        time: (/* @__PURE__ */ new Date()).getTime() / 1e3,
        platform: config.platform,
        landing_page: window.location.href,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        fbclid,
        fbc,
        fbp,
        js: true,
        g4_client_id,
        track_events: config.trackPageViewWithVisit ? [visitPageViewEvent()] : []
      };
      if (document.referrer.length > 0) {
        data.referrer = document.referrer;
      }
      for (var key in config.visitParams) {
        if (config.visitParams.hasOwnProperty(key)) {
          data[key] = config.visitParams[key];
        }
      }
      log(data);
      visitTrackedThisRequest = true;
      sendRequest(visitsUrl(), data, function(_data, _textStatus, jqXHR) {
        if (config.extendedInstrumentation) {
          var visitResponseCode = jqXHR.status;
          var headers = config.extendedIntrumentationResponseHeaders.map(function(header) {
            return header + "_" + jqXHR.getResponseHeader(header);
          }).join("__");
          setCookie("cfhoy_extended_instrumentation", visitResponseCode + "__" + headers, config.visitDuration);
          setCookie("cfhoy_successful_visit_track", visitId, config.visitDuration);
        }
        destroyCookie("cfhoy_track");
        setReady();
      });
    } else {
      log("Cookies disabled");
      setReady();
    }
  }
}
function visitPageViewEvent() {
  var additionalProperties = config.trackPageViewWithVisitAdditionalProps() || {};
  return trackEventData("$view", trackPageViewData(additionalProperties));
}
function trackEventData(name, properties) {
  var event = {
    name,
    properties: properties || {},
    time: (/* @__PURE__ */ new Date()).getTime() / 1e3,
    id: generateId(name === "$view" ? "pageview" : null),
    source: window.location.href,
    js: true
  };
  return event;
}
function trackPageViewData(additionalProperties) {
  var properties = {
    url: window.location.href,
    title: document.title,
    page: page(),
    platform: config.platform
  };
  if (additionalProperties) {
    for (var propName in additionalProperties) {
      if (additionalProperties.hasOwnProperty(propName)) {
        properties[propName] = additionalProperties[propName];
      }
    }
  }
  return properties;
}
var Cookies, QueryString, config, ahoy, $2, visitId, visitorId, track, isReady, queue, canStringify, eventQueue, visitTrackedThisRequest, idCache, i, originalStart;
var init_cfhoy_esm = __esm({
  "node_modules/@clickfunnels2/cfhoy.js/dist/cfhoy.esm.js"() {
    init_define_process();
    init_esm_browser();
    Cookies = {
      set: function(name, value, ttl, domain) {
        var expires = "";
        var cookieDomain = "";
        if (ttl) {
          var date = /* @__PURE__ */ new Date();
          date.setTime(date.getTime() + ttl * 60 * 1e3);
          expires = "; expires=" + date.toGMTString();
        }
        if (domain) {
          cookieDomain = "; domain=" + domain;
        }
        document.cookie = name + "=" + escape(value) + expires + cookieDomain + "; path=/; samesite=lax";
      },
      get: function(name) {
        var i, c;
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (i = 0; i < ca.length; i++) {
          c = ca[i];
          while (c.charAt(0) === " ") {
            c = c.substring(1, c.length);
          }
          if (c.indexOf(nameEQ) === 0) {
            return unescape(c.substring(nameEQ.length, c.length));
          }
        }
        return null;
      }
    };
    QueryString = {
      get: function(name) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (decodeURIComponent(pair[0]) == name) {
            return decodeURIComponent(pair[1]);
          }
        }
        return null;
      }
    };
    config = {
      urlPrefix: "",
      visitsUrl: "/ahoy/visits",
      eventsUrl: "/ahoy/events",
      page: null,
      platform: "Web",
      useBeacon: true,
      startOnReady: true,
      trackVisits: true,
      cookies: true,
      cookieDomain: null,
      trackPageViewWithVisit: false,
      headers: {},
      visitParams: {},
      withCredentials: false,
      visitDuration: 4 * 60,
      // default 4 hours
      visitorDuration: 2 * 365 * 24 * 60,
      // default 2 years,
      trackPageViewWithVisitAdditionalProps: function() {
      },
      extendedInstrumentation: false,
      extendedIntrumentationResponseHeaders: ["X-Clickfunnels-Version"]
    };
    ahoy = window.ahoy || window.Ahoy || {};
    ahoy.configure = function(options) {
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          config[key] = options[key];
        }
      }
    };
    ahoy.configure(ahoy);
    $2 = window.jQuery || window.Zepto || window.$;
    isReady = false;
    queue = [];
    canStringify = typeof JSON !== "undefined" && typeof JSON.stringify !== "undefined";
    eventQueue = [];
    visitTrackedThisRequest = false;
    idCache = {};
    ahoy.ready = function(callback) {
      if (isReady) {
        callback();
      } else {
        queue.push(callback);
      }
    };
    ahoy.getVisitId = ahoy.getVisitToken = function() {
      return getCookie("cfhoy_visit");
    };
    ahoy.getVisitorId = ahoy.getVisitorToken = function() {
      return getCookie("cfhoy_visitor");
    };
    ahoy.reset = function() {
      destroyCookie("cfhoy_visit");
      destroyCookie("cfhoy_visitor");
      destroyCookie("cfhoy_events");
      destroyCookie("cfhoy_track");
      destroyCookie("cfhoy_successful_visit_track");
      visitTrackedThisRequest = false;
      ahoy.start = originalStart;
      return true;
    };
    ahoy.debug = function(enabled) {
      if (enabled === false) {
        destroyCookie("cfhoy_debug");
      } else {
        setCookie("cfhoy_debug", "t", 365 * 24 * 60);
      }
      return true;
    };
    ahoy.track = function(name, properties) {
      var event = trackEventData(name, properties);
      ahoy.ready(function() {
        if (config.cookies && !ahoy.getVisitId()) {
          createVisit();
        }
        ahoy.ready(function() {
          log(event);
          event.visit_token = ahoy.getVisitId();
          event.visitor_token = ahoy.getVisitorId();
          var documentEvent = new CustomEvent("cfhoy:tracked", { detail: event });
          document.dispatchEvent(documentEvent);
          if (name === "$view" && config.trackPageViewWithVisit && visitTrackedThisRequest) {
            return;
          }
          if (canTrackNow()) {
            trackEventNow(event);
          } else {
            eventQueue.push(event);
            saveEventQueue();
            setTimeout(function() {
              trackEvent(event);
            }, 1e3);
          }
        });
      });
      return true;
    };
    ahoy.trackView = function(additionalProperties) {
      ahoy.track("$view", trackPageViewData(additionalProperties));
    };
    ahoy.trackClicks = function(selector) {
      if (selector === void 0) {
        throw new Error("Missing selector");
      }
      onEvent("click", selector, function(e) {
        var properties = eventProperties.call(this, e);
        properties.text = properties.tag == "input" ? this.value : (this.textContent || this.innerText || this.innerHTML).replace(/[\s\r\n]+/g, " ").trim();
        properties.href = this.href;
        ahoy.track("$click", properties);
      });
    };
    ahoy.trackSubmits = function(selector) {
      if (selector === void 0) {
        throw new Error("Missing selector");
      }
      onEvent("submit", selector, function(e) {
        var properties = eventProperties.call(this, e);
        ahoy.track("$submit", properties);
      });
    };
    ahoy.trackChanges = function(selector) {
      log("trackChanges is deprecated and will be removed in 0.5.0");
      if (selector === void 0) {
        throw new Error("Missing selector");
      }
      onEvent("change", selector, function(e) {
        var properties = eventProperties.call(this, e);
        ahoy.track("$change", properties);
      });
    };
    try {
      eventQueue = JSON.parse(getCookie("cfhoy_events") || "[]");
    } catch (e) {
    }
    for (i = 0; i < eventQueue.length; i++) {
      trackEvent(eventQueue[i]);
    }
    ahoy.start = function() {
      createVisit();
      ahoy.start = function() {
      };
    };
    originalStart = ahoy.start;
    documentReady(function() {
      if (config.startOnReady) {
        ahoy.start();
      }
    });
  }
});

// projects/user_pages/app/javascript/lander/track_events.js
var track_events_exports = {};
function cfhoyVisitorData() {
  return {
    firstName: Cookies.get("contact_first_name"),
    lastName: Cookies.get("contact_last_name"),
    emailAddress: Cookies.get("contact_email_address"),
    phoneNumber: Cookies.get("contact_phone_number"),
    postalCode: Cookies.get("contact_postal_code"),
    country: Cookies.get("contact_country"),
    uuid: Cookies.get("cfhoy_visitor")
  };
}
function getLeadEventID() {
  return Cookies.get("cfhoy_lead_event_id");
}
function removeLeadEventID() {
  Cookies.set("cfhoy_lead_event_id", "", -1);
  return true;
}
function getPurchaseEventID() {
  return Cookies.get("cfhoy_purchase_event_id");
}
function removePurchaseEventID() {
  Cookies.set("cfhoy_purchase_event_id", "", -1);
  return true;
}
function getRenderedPage() {
  return document.querySelector('meta[name="rendered-page-url"]')?.getAttribute("content");
}
function isLivePage(queryString) {
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("preview") !== "true";
}
var livePage, trackingDisabled, renderedPage;
var init_track_events = __esm({
  "projects/user_pages/app/javascript/lander/track_events.js"() {
    init_define_process();
    init_cfhoy_esm();
    init_cfhoy_esm();
    livePage = isLivePage(window.location.search);
    trackingDisabled = window.disableTracking;
    renderedPage = getRenderedPage();
    ahoy.configure({
      urlPrefix: "/_cf",
      visitsUrl: "/s",
      eventsUrl: "/a",
      platform: "Web",
      useBeacon: true,
      startOnReady: false,
      trackVisits: true,
      cookies: true,
      withCredentials: false,
      visitDuration: 4 * 60,
      // 4 hours
      visitorDuration: 2 * 365 * 24 * 60,
      // 2 years
      page: renderedPage,
      trackPageViewWithVisit: true,
      trackPageViewWithVisitAdditionalProps: () => ({
        cfhoy_visitor: Cookies.get("cfhoy_visitor") || "",
        request_type: "visit"
      }),
      extendedInstrumentation: true
    });
    if (!trackingDisabled && livePage) {
      const startCfHoy = () => {
        if (window._cfHoyStarted) return;
        window._cfHoyStarted = true;
        ahoy.start();
      };
      if (document.readyState === "complete") {
        startCfHoy();
      } else {
        window.addEventListener("load", startCfHoy);
      }
      document.addEventListener("cfhoy:tracked", function(event) {
        window.dataLayer = window.dataLayer || [];
        if (event.detail.name == "$view") {
          const visitorData = cfhoyVisitorData();
          dataLayer.push({
            event: "cfPageView",
            contactFirstName: visitorData.firstName,
            contactLastName: visitorData.lastName,
            contactEmailAddress: visitorData.emailAddress,
            contactPhoneNumber: visitorData.phoneNumber,
            contactPostalCode: visitorData.postalCode,
            contactCountry: visitorData.country,
            contactExternalID: visitorData.uuid,
            visitEventID: event.detail.id
          });
        }
      });
      document.addEventListener("DOMContentLoaded", function(event) {
        const additionalProps = {
          cfhoy_visitor: Cookies.get("cfhoy_visitor") || "",
          request_type: "trackView"
        };
        ahoy.trackView(additionalProps);
        $(document).on("click", '[event-tracking="enable"]', function() {
          const data = {
            url: window.location.href,
            page: renderedPage || window.location.pathname,
            title: document.title
          };
          ahoy.track("$button_click", data);
        });
      });
    }
    document.addEventListener("DOMContentLoaded", function(event) {
      window.dataLayer = window.dataLayer || [];
      const visitorData = cfhoyVisitorData();
      const leadEventID = getLeadEventID();
      const purchaseEventID = getPurchaseEventID();
      if (leadEventID) {
        dataLayer.push({
          event: "cfLead",
          contactFirstName: visitorData.firstName,
          contactLastName: visitorData.lastName,
          contactEmailAddress: visitorData.emailAddress,
          contactPhoneNumber: visitorData.phoneNumber,
          contactPostalCode: visitorData.postalCode,
          contactCountry: visitorData.country,
          contactExternalID: visitorData.uuid,
          leadEventID
        });
        removeLeadEventID();
      }
      if (purchaseEventID) {
        dataLayer.push({
          event: "cfPurchase",
          contactFirstName: visitorData.firstName,
          contactLastName: visitorData.lastName,
          contactEmailAddress: visitorData.emailAddress,
          contactPhoneNumber: visitorData.phoneNumber,
          contactPostalCode: visitorData.postalCode,
          contactCountry: visitorData.country,
          contactExternalID: visitorData.uuid,
          purchaseEventID
        });
        removePurchaseEventID();
      }
    });
  }
});

// projects/user_pages/app/javascript/lander/resource_sharing_concern.js
var resource_sharing_concern_exports = {};
var init_resource_sharing_concern = __esm({
  "projects/user_pages/app/javascript/lander/resource_sharing_concern.js"() {
    init_define_process();
    init_cfhoy_esm();
    document.addEventListener("DOMContentLoaded", function() {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const ttl = 30 * 24 * 60;
      const workspace_sharing_id = urlParams.get("workspace_sharing_id");
      if (workspace_sharing_id) {
        Cookies.set("workspace_sharing_id", workspace_sharing_id, ttl);
      }
      const resource_install_intent_ttl = 24 * 60 * 60;
      const resource_install_intent = urlParams.get("resource_install_intent");
      if (resource_install_intent) {
        Cookies.set("resource_install_intent", resource_install_intent, resource_install_intent_ttl);
      }
      const awid_ttl = 60 * 60;
      const awid = urlParams.get("awid");
      if (awid) {
        Cookies.set("awid", awid, awid_ttl);
      }
    });
  }
});

// projects/user_pages/app/javascript/lander/vendor/mailCheck/domains.ts
var defaultDomains, defaultSecondLevelDomains, defaultTopLevelDomains;
var init_domains = __esm({
  "projects/user_pages/app/javascript/lander/vendor/mailCheck/domains.ts"() {
    init_define_process();
    defaultDomains = [
      "msn.com",
      "bellsouth.net",
      "telus.net",
      "comcast.net",
      "optusnet.com.au",
      "earthlink.net",
      "qq.com",
      "sky.com",
      "icloud.com",
      "mac.com",
      "sympatico.ca",
      "googlemail.com",
      "att.net",
      "xtra.co.nz",
      "web.de",
      "cox.net",
      "gmail.com",
      "ymail.com",
      "aim.com",
      "rogers.com",
      "verizon.net",
      "rocketmail.com",
      "google.com",
      "optonline.net",
      "sbcglobal.net",
      "aol.com",
      "me.com",
      "btinternet.com",
      "charter.net",
      "shaw.ca"
    ];
    defaultSecondLevelDomains = ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"];
    defaultTopLevelDomains = [
      "com",
      "com.au",
      "com.tw",
      "ca",
      "co.nz",
      "co.uk",
      "de",
      "fr",
      "it",
      "ru",
      "net",
      "org",
      "edu",
      "gov",
      "jp",
      "nl",
      "kr",
      "se",
      "eu",
      "ie",
      "co.il",
      "us",
      "at",
      "be",
      "dk",
      "hk",
      "es",
      "gr",
      "ch",
      "no",
      "cz",
      "in",
      "net",
      "net.au",
      "info",
      "biz",
      "mil",
      "co.jp",
      "sg",
      "hu",
      "uk",
      "io"
    ];
  }
});

// projects/user_pages/app/javascript/lander/vendor/mailCheck/main.ts
var define, Mailcheck;
var init_main = __esm({
  "projects/user_pages/app/javascript/lander/vendor/mailCheck/main.ts"() {
    init_define_process();
    init_domains();
    Mailcheck = {
      domainThreshold: 2,
      secondLevelThreshold: 2,
      topLevelThreshold: 2,
      run: function(opts) {
        opts.domains = opts.domains || defaultDomains;
        opts.secondLevelDomains = opts.secondLevelDomains || defaultSecondLevelDomains;
        opts.topLevelDomains = opts.topLevelDomains || defaultTopLevelDomains;
        opts.distanceFunction = opts.distanceFunction || Mailcheck.sift4Distance;
        const defaultCallback = function(result2) {
          return result2;
        };
        const suggestedCallback = opts.suggested || defaultCallback;
        const emptyCallback = opts.empty || defaultCallback;
        const result = Mailcheck.suggest(
          Mailcheck.encodeEmail(opts.email),
          opts.domains,
          opts.secondLevelDomains,
          opts.topLevelDomains,
          opts.distanceFunction
        );
        return result ? suggestedCallback(result) : emptyCallback();
      },
      suggest: function(email, domains, secondLevelDomains, topLevelDomains, distanceFunction) {
        email = email.toLowerCase();
        const emailParts = this.splitEmail(email);
        if (secondLevelDomains && topLevelDomains) {
          if (secondLevelDomains.indexOf(emailParts.secondLevelDomain) !== -1 && topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1) {
            return false;
          }
        }
        let closestDomain = this.findClosestDomain(emailParts.domain, domains, distanceFunction, this.domainThreshold);
        if (closestDomain) {
          if (closestDomain == emailParts.domain) {
            return false;
          } else {
            return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
          }
        }
        const closestSecondLevelDomain = this.findClosestDomain(
          emailParts.secondLevelDomain,
          secondLevelDomains,
          distanceFunction,
          this.secondLevelThreshold
        );
        const closestTopLevelDomain = this.findClosestDomain(
          emailParts.topLevelDomain,
          topLevelDomains,
          distanceFunction,
          this.topLevelThreshold
        );
        if (emailParts.domain) {
          closestDomain = emailParts.domain;
          let rtrn = false;
          if (closestSecondLevelDomain && closestSecondLevelDomain != emailParts.secondLevelDomain) {
            closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
            rtrn = true;
          }
          if (closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain && emailParts.secondLevelDomain !== "") {
            closestDomain = closestDomain.replace(new RegExp(emailParts.topLevelDomain + "$"), closestTopLevelDomain);
            rtrn = true;
          }
          if (rtrn) {
            return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
          }
        }
        return false;
      },
      findClosestDomain: function(domain, domains, distanceFunction, threshold) {
        threshold = threshold || this.topLevelThreshold;
        let dist;
        let minDist = Infinity;
        let closestDomain = null;
        if (!domain || !domains) {
          return false;
        }
        if (!distanceFunction) {
          distanceFunction = this.sift4Distance;
        }
        for (let i = 0; i < domains.length; i++) {
          if (domain === domains[i]) {
            return domain;
          }
          dist = distanceFunction(domain, domains[i]);
          if (dist < minDist) {
            minDist = dist;
            closestDomain = domains[i];
          }
        }
        if (minDist <= threshold && closestDomain !== null) {
          return closestDomain;
        } else {
          return false;
        }
      },
      sift4Distance: function(s1, s2, maxOffset) {
        if (maxOffset === void 0) {
          maxOffset = 5;
        }
        if (!s1 || !s1.length) {
          if (!s2) {
            return 0;
          }
          return s2.length;
        }
        if (!s2 || !s2.length) {
          return s1.length;
        }
        const l1 = s1.length;
        const l2 = s2.length;
        let c1 = 0;
        let c2 = 0;
        let lcss = 0;
        let local_cs = 0;
        let trans = 0;
        const offset_arr = [];
        while (c1 < l1 && c2 < l2) {
          if (s1.charAt(c1) == s2.charAt(c2)) {
            local_cs++;
            let isTrans = false;
            let i = 0;
            while (i < offset_arr.length) {
              const ofs = offset_arr[i];
              if (c1 <= ofs.c1 || c2 <= ofs.c2) {
                isTrans = Math.abs(c2 - c1) >= Math.abs(ofs.c2 - ofs.c1);
                if (isTrans) {
                  trans++;
                } else {
                  if (!ofs.trans) {
                    ofs.trans = true;
                    trans++;
                  }
                }
                break;
              } else {
                if (c1 > ofs.c2 && c2 > ofs.c1) {
                  offset_arr.splice(i, 1);
                } else {
                  i++;
                }
              }
            }
            offset_arr.push({
              c1,
              c2,
              trans: isTrans
            });
          } else {
            lcss += local_cs;
            local_cs = 0;
            if (c1 != c2) {
              c1 = c2 = Math.min(c1, c2);
            }
            for (let j = 0; j < maxOffset && (c1 + j < l1 || c2 + j < l2); j++) {
              if (c1 + j < l1 && s1.charAt(c1 + j) == s2.charAt(c2)) {
                c1 += j - 1;
                c2--;
                break;
              }
              if (c2 + j < l2 && s1.charAt(c1) == s2.charAt(c2 + j)) {
                c1--;
                c2 += j - 1;
                break;
              }
            }
          }
          c1++;
          c2++;
          if (c1 >= l1 || c2 >= l2) {
            lcss += local_cs;
            local_cs = 0;
            c1 = c2 = Math.min(c1, c2);
          }
        }
        lcss += local_cs;
        return Math.round(Math.max(l1, l2) - lcss + trans);
      },
      splitEmail: function(email) {
        email = email !== null ? email.replace(/^\s*/, "").replace(/\s*$/, "") : null;
        const parts = email.split("@");
        if (parts.length < 2) {
          return false;
        }
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === "") {
            return false;
          }
        }
        const domain = parts.pop();
        const domainParts = domain.split(".");
        let sld = "";
        let tld = "";
        if (domainParts.length === 0) {
          return false;
        } else if (domainParts.length == 1) {
          tld = domainParts[0];
        } else {
          sld = domainParts[0];
          for (let j = 1; j < domainParts.length; j++) {
            tld += domainParts[j] + ".";
          }
          tld = tld.substring(0, tld.length - 1);
        }
        return {
          topLevelDomain: tld,
          secondLevelDomain: sld,
          domain,
          address: parts.join("@")
        };
      },
      // Encode the email address to prevent XSS but leave in valid
      // characters, following this official spec:
      // http://en.wikipedia.org/wiki/Email_address#Syntax
      encodeEmail: function(email) {
        let result = encodeURI(email);
        result = result.replace("%20", " ").replace("%25", "%").replace("%5E", "^").replace("%60", "`").replace("%7B", "{").replace("%7C", "|").replace("%7D", "}");
        return result;
      }
    };
    if (typeof define === "function" && define.amd) {
      define("mailcheck", [], function() {
        return Mailcheck;
      });
    }
    if (typeof window !== "undefined" && window.jQuery) {
      ;
      (function($4) {
        $4.fn.mailcheck = function(opts) {
          const self = this;
          if (opts.suggested) {
            const oldSuggested = opts.suggested;
            opts.suggested = function(result) {
              oldSuggested(self, result);
            };
          }
          if (opts.empty) {
            const oldEmpty = opts.empty;
            opts.empty = function() {
              oldEmpty.call(null, self);
            };
          }
          opts.email = this.val();
          Mailcheck.run(opts);
        };
      })(jQuery);
    }
  }
});

// projects/user_pages/app/javascript/lander/submit.ts
var submit_exports = {};
__export(submit_exports, {
  checkValidInputs: () => checkValidInputs,
  restoreButtonState: () => restoreButtonState,
  submitPage: () => submitPage
});
function restoreButtonState() {
  $3('.elBTN a[href="#submit-form"]').each(function() {
    const $this = $3(this);
    const $text = $this.find(".elButtonMainText");
    const $subText = $this.find(".elButtonSub");
    const previousText = $this.attr("data-before-submit-text");
    const previousSub = $this.attr("data-before-submit-sub");
    const loadingSpinner = $text.parent().find(".elButtonSpinner");
    loadingSpinner.css("display", "none");
    if (previousText) {
      $this.removeClass("cf-submitting-page");
      $text.text(previousText);
      $subText.text(previousSub);
      $this.removeAttr("data-before-submit-text");
      $this.removeAttr("data-before-submit-sub");
    }
  });
}
function setButtonSubmitText(text, subtext) {
  $3('.elBTN a[href="#submit-form"]').each(function() {
    const $this = $3(this);
    const $text = $this.find(".elButtonMainText");
    const $subText = $this.find(".elButtonSub");
    const submitText = text ?? ($this.attr("data-param-submittingtext")?.length ? $this.attr("data-param-submittingtext") : "Submitting...");
    const dataBeforeSubmit = $this.attr("data-before-submit-text");
    if (!dataBeforeSubmit) {
      $this.attr("data-before-submit-text", $text.text());
      $this.attr("data-before-submit-sub", $subText.text());
      $this.addClass("cf-submitting-page");
    }
    const loadingSpinner = $this.find(".elButtonSpinner");
    $text.text(`${submitText}`);
    $subText.text(subtext ?? "");
    loadingSpinner.css("display", "inline-block");
  });
}
async function sleepMs(timeMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}
function getRenderedHref() {
  const renderedPage2 = document.querySelector('meta[name="rendered-page-url"]')?.getAttribute("content");
  const renderedPath = renderedPage2 ?? window.location.pathname;
  const url = new URL(window.location.href);
  url.pathname = renderedPath;
  return url.toString();
}
async function submitOrderAsync(body, maxRetries = 3, onBeforeSubmit, onRetryAfter) {
  let response;
  for (let i = 0; i < maxRetries; i++) {
    try {
      onBeforeSubmit();
      response = await fetch(getRenderedHref(), {
        credentials: "same-origin",
        method: "post",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CF2-POST-TYPE": "submit"
        }
      });
      if (response.status === 429) {
        const sleepTime = parseInt(response.headers.get("Retry-After"));
        onRetryAfter(sleepTime);
        console.log(`Waiting on queue, retrying after ${sleepTime}`);
        await sleepMs(sleepTime);
      } else {
        break;
      }
    } catch (err) {
      console.log(err);
      await sleepMs(5e3);
    }
  }
  return response;
}
function submitPage() {
  const data = globalThis.processForm();
  $3("#cfAR .purchaseInput").remove();
  data.purchase?.product_variants?.forEach((pv) => {
    $3("#cfAR").append(
      `<input type="text" class="purchaseInput" name="purchase[product_variants][][id]" value="${pv.id}" />`
    );
    $3("#cfAR").append(
      `<input type="number" class="purchaseInput" name="purchase[product_variants][][quantity]" value="${pv.quantity}"/>`
    );
    $3("#cfAR").append(
      `<input type="number" class="purchaseInput" name="purchase[product_variants][][price_id]" value="${pv.price_id}" />`
    );
  });
  data.purchase?.coupon_codes?.forEach((couponCode) => {
    $3("#cfAR").append(
      `<input type="text" class="purchaseInput" name="purchase[coupon_codes][]" value="${couponCode}" />`
    );
  });
  $3("#cfAR").append('<input type="text" class="purchaseInput" name="purchase[process_new_order]" value="true" />');
  clearBlankInputFields();
  const formData = $3("#cfAR").serialize();
  let timer = null;
  globalThis.CFDispatchEvent(CFEvents.FORM_SUBMITTED, data);
  submitOrderAsync(
    formData,
    3,
    () => {
      clearInterval(timer);
      setButtonSubmitText();
    },
    (sleepTime) => {
      let remainingSeconds = sleepTime / 1e3;
      clearInterval(timer);
      timer = setInterval(() => {
        remainingSeconds -= 1;
        setButtonSubmitText("Waiting on queue", `(Retrying in ${remainingSeconds}s)`);
      }, 1e3);
    }
  ).then((response) => {
    if (response.status == 422) {
      response.json().then((responseJson) => {
        clearInterval(timer);
        window.dispatchEvent(
          new CustomEvent("checkout:order-submit-errors", {
            detail: {
              error: `Failed to submit: ${responseJson.error}`
            }
          })
        );
        restoreButtonState();
      });
    } else if (response.ok) {
      globalThis.CFDispatchEvent(CFEvents.FORM_SUBMITTED_OK, data);
      restoreButtonState();
      if (response.headers.get("X-CF2-APPROVAL-URL")) {
        const approvalUrl = response.headers.get("X-CF2-APPROVAL-URL");
        const auxWrapper = document.querySelector(".multiple-payment-aux-frame");
        const $auxWrapper = $3(auxWrapper);
        const iframe = document.createElement("iframe");
        const orderStautsIframe = "/cf_order_status?disable-dispatch=true";
        iframe.onload = () => {
          if (iframe.src.includes(orderStautsIframe)) {
            $auxWrapper.css("display", "flex");
            iframe.src = approvalUrl;
          }
        };
        auxWrapper.innerHTML = "";
        auxWrapper.appendChild(iframe);
        iframe.src = orderStautsIframe;
      } else {
        globalThis.CFDispatchEvent(CFEvents.FORM_SUBMITTED_FINALIZED, data);
        window.location.href = response.headers.get("Location");
      }
    } else if (response.status === 429) {
      clearInterval(timer);
      setButtonSubmitText("Failed to submit", "Retry again in a few seconds");
      sleepMs(5e3).then(() => {
        window.dispatchEvent(new CustomEvent("payments:submit-failed"));
        restoreButtonState();
      });
    } else if (response.status >= 300 && response.status < 400) {
      window.location.href = response.headers.get("Location") ?? window.location.href;
    } else {
      window.dispatchEvent(new CustomEvent("checkout:order-submit-errors"));
    }
  }).catch((err) => {
    console.log(err);
    clearInterval(timer);
    window.dispatchEvent(new CustomEvent("payments:submit-failed"));
    restoreButtonState();
  });
}
function clearBlankInputFields() {
  $3("#cfAR").find("input,select,textarea").each((index, input) => {
    if (input.value == "" && !input.classList.contains("keep")) {
      input.remove();
    }
  });
}
function getPurchaseForm() {
  const orderCart = window["OrderCart/V1"]?.default;
  if (!orderCart) return {};
  const products = orderCart?.productVariants;
  const formPurchaseProductVariants = products?.map((product) => {
    return {
      id: product.id,
      price_id: product.priceId,
      quantity: product.quantity
    };
  });
  const rebillyToken = $3('#cfAR input[data-rebilly="token"]').val();
  return {
    purchase: {
      product_variants: formPurchaseProductVariants,
      rebilly_token: rebillyToken,
      coupon_codes: [orderCart?.couponCode].filter(Boolean)
    }
  };
}
function getAppointmentScheduleRequestForm() {
  const request = { appointments_schedule_request: {} };
  document.querySelectorAll(".appointment_schedule_request_field").forEach((field) => {
    const fieldName = field.getAttribute("name")?.replace("appointment_schedule_request_", "");
    cfARAppendInput(`appointments_schedule_request[${fieldName}]`, field.value, {
      param: `appointments_schedule_request[${fieldName}]`
    });
    request.appointments_schedule_request[fieldName] = field.value;
  });
  const emailField = document.querySelector("[name='email']");
  if (emailField) {
    const cfEmailInput = document.querySelector("#cf_contact_email");
    cfEmailInput.value = emailField.value;
  }
  const guestEmailInputs = document.querySelectorAll("input.guest-input");
  const guestEmailStrings = [];
  guestEmailInputs.forEach((i) => guestEmailStrings.push(i.value));
  cfARAppendInput("appointments_schedule_request[guest_emails]", guestEmailStrings.join(","));
  return request;
}
function getContactForm() {
  const data = { contact: {} };
  $3('.elFormItem:not([data-prevent-submit="true"])').each(function() {
    const $this = $3(this);
    if ($this.parents('[data-page-element="Checkout/V2"]').length > 0) return;
    let name = $this.attr("name");
    if (name == "" || name == "not-set") return;
    if (["country", "state"].includes(name)) {
      name = "shipping_" + name;
    }
    let value = $this.val();
    if (name == "phone_number" && this.iti) {
      value = this.iti.getNumber();
    }
    if (this.getAttribute("type") == "checkbox") {
      if (name.endsWith("[]")) {
        const checkboxName = name.slice(0, -2);
        if (!data.contact[checkboxName]) {
          data.contact[checkboxName] = [];
        }
        if ($this.is(":checked")) {
          data.contact[checkboxName].push(value);
        } else {
          const index = data.contact[checkboxName].indexOf(value);
          if (index > -1) {
            data.contact[checkboxName].splice(index, 1);
          }
        }
        return;
      } else {
        value = $this.is(":checked");
        data.contact[name] = value;
      }
    } else if (value) {
      data.contact[name] = value;
    }
    const $contactInput = $3("#cf_contact_" + name);
    if ($contactInput.length == 0 && name) {
      let customType = name.toLowerCase();
      customType = customType.replace(/\s+/g, "_");
      $3("#cf_contact_" + customType).remove();
      cfARAppendInput(customType, value, { prefix: "cf_contact_" });
    } else {
      if ($this.attr("data-prevent-submit") == "true") {
        $contactInput.val("");
      } else {
        $contactInput.val(value);
      }
    }
  });
  return data;
}
function handleMultiCheckboxForm() {
  $3('.elGroupedCheckbox .elFormItem:not([data-prevent-submit="true"])').each(function() {
    const $this = $3(this);
    const name = $this.attr("name");
    const value = $this.val();
    const checked = $this.is(":checked");
    if (checked && value && !document.querySelector(`#cfAR input[name="${name}"][value="${value}"]`)) {
      cfARAppendInput(name, value);
    } else if (!document.querySelector(`#cfAR input[name="${name}"]`)) {
      cfARAppendInput(name, "", { keep: true });
    }
  });
  return {};
}
function cfARAppendInput(name, value, options = {}) {
  const input = document.createElement("INPUT");
  const prefix = options["prefix"] || "cf_";
  const param = options["param"] || name;
  const keep = options["keep"] || false;
  input.id = prefix + name;
  input.name = name;
  input.setAttribute("value", value);
  if (keep) {
    input.classList.add("keep");
  }
  input.setAttribute("data-cf-form-field", name);
  input.setAttribute("data-param", param);
  input.setAttribute("data-storage", "false");
  $3("#cfAR").append(input);
}
function validateEmail(email) {
  email = $3.trim(email);
  const re = /^(([^<>()[\]\\.,;:#`%\s@"]+(\.[^<>()[\]\\.,;:#`%\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
function updateInputStyle(selectedInput, type) {
  if (type === "error") {
    selectedInput.css("border-color", "#B91517");
    selectedInput.css("border-width", "3px");
    selectedInput.css("border-style", "solid");
  } else {
    selectedInput.css("border-color", "#4a8920");
    selectedInput.css("border-width", "3px");
    selectedInput.css("border-style", "solid");
  }
}
function checkValidInputs() {
  const popupVisibleCheck = $3(".modal-wrapper").is(":visible");
  let fail = false;
  let elementPathSelector;
  if (popupVisibleCheck == true) {
    elementPathSelector = '#modalPopup .elFormItem.required1, #modalPopup .elFormItem[name="phone_number"]';
  } else {
    elementPathSelector = '.pageRoot .elFormItem.required1, .pageRoot .elFormItem[name="phone_number"]';
  }
  $3(elementPathSelector).each(function() {
    const $this = $3(this);
    const visible = $this.is(":visible");
    const isRequired = $this.hasClass("required1");
    if (visible) {
      let value = $this.val();
      const isSelect = $this.is("select");
      if (isSelect) value = $this.find(":selected").attr("value");
      const parent = $this.parents(".elFormItemWrapper");
      const selector = ".inputHolder, .borderHolder, .elCheckbox";
      const selectedInput = parent.length && parent.find(selector).length ? parent.find(selector) : $this;
      if (selectedInput.is(":checkbox") ? !selectedInput.is(":checked") : isRequired && (value === null || typeof value === "undefined" || value === "")) {
        fail = true;
        updateInputStyle(selectedInput, "error");
      } else {
        if (selectedInput.attr("name") == "email") {
          if (validateEmail(value)) {
            updateInputStyle(selectedInput, "valid");
          } else {
            fail = true;
            updateInputStyle(selectedInput, "error");
          }
        } else if (selectedInput.attr("name") == "phone_number" && selectedInput.get(0).iti) {
          if (selectedInput.get(0).iti.isValidNumber() || !isRequired && !value) {
            updateInputStyle(selectedInput, "valid");
          } else {
            fail = true;
            updateInputStyle(selectedInput, "error");
          }
        } else {
          updateInputStyle(selectedInput, "valid");
        }
      }
    }
  });
  if (popupVisibleCheck == true) {
    elementPathSelector = "#modalPopup .elGroupedCheckboxWrapper.required1";
  } else {
    elementPathSelector = ".pageRoot .elGroupedCheckboxWrapper.required1";
  }
  $3(elementPathSelector).each(function() {
    const $this = $3(this);
    const $checkboxes = $this.find(".elCheckboxInput");
    const checked = $checkboxes.toArray().some((checkbox) => $3(checkbox).is(":checked"));
    fail = !checked;
    updateInputStyle($this, fail ? "error" : "valid");
  });
  return fail == false;
}
function mailCheck() {
  const inputsSelector = Array.from(document.getElementsByName("email"));
  inputsSelector.forEach((input, index) => {
    const mailCheckNode = document.createElement("div");
    mailCheckNode.classList.add("mailcheck");
    mailCheckNode.classList.add(`index${index}`);
    input.parentElement.appendChild(mailCheckNode);
    input.addEventListener("blur", function() {
      Mailcheck.run({
        email: this.value,
        domains: defaultDomains,
        secondLevelDomains: defaultSecondLevelDomains,
        // optional
        topLevelDomains: defaultTopLevelDomains,
        // optional
        suggested: function(suggestion) {
          mailCheckNode.innerHTML = `<span>Did you mean <b>${suggestion.full}?</b></span>`;
        },
        empty: function() {
          mailCheckNode.innerHTML = "";
        }
      });
    });
  });
}
function handleEnterSubmit() {
  const popupVisibleCheck = $3(".modal-wrapper").is(":visible");
  let buttonsPathSelector;
  if (popupVisibleCheck == true) {
    buttonsPathSelector = '#modalPopup .elBTN a[href="#submit-form"]:visible';
  } else {
    buttonsPathSelector = '.pageRoot .elBTN a[href="#submit-form"]:visible';
  }
  const submitButton = $3(buttonsPathSelector).first();
  const now = Date.now();
  if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
    return;
  }
  lastSubmitTime = now;
  handleFormSubmit(submitButton);
}
function setupEnterKeySubmit() {
  const inputsPathSelector = ".elFormItem";
  $3(inputsPathSelector).each(function() {
    const thisInput = $3(this);
    if (thisInput.closest('[data-page-element="Checkout/V1"]').length > 0) {
      return true;
    }
    if (thisInput.closest('[data-page-element="Checkout/V2"]').length > 0) {
      return true;
    }
    thisInput.on("keypress", function(evt) {
      if (evt.originalEvent?.isComposing || evt.keyCode === 229) return;
      if (evt.key === "Enter") {
        handleEnterSubmit();
      }
    });
  });
}
function setRedirectOverride($button) {
  let redirectOverride;
  if ($button.parents(".elBTN").length) {
    redirectOverride = $button.attr("data-on-submit-go-to");
  }
  if (redirectOverride) {
    $3("#cfAR").append(`<input type="text" class="redirectParams" name="redirect_to" value="${redirectOverride}" />`);
  } else {
    $3("#cfAR .redirectParams").remove();
  }
}
function handleFormSubmit($button) {
  setRedirectOverride($button);
  setButtonSubmitText();
  if ($3(".pai-payment-methods-inner:visible").length > 0) {
    const $rebillySubmit = $3(".pai-submit");
    const $rebillyForm = $3(".elPAI");
    if ($rebillySubmit.length) {
      $rebillySubmit.trigger("click");
      return;
    } else if ($rebillyForm.length) {
      rebillyProcessOrder();
      return;
    } else if (!checkValidInputs()) {
      restoreButtonState();
      return;
    }
  }
  if (checkValidInputs()) {
    submitPage();
  } else {
    restoreButtonState();
  }
  return true;
}
var $3, lastSubmitTime, SUBMIT_COOLDOWN;
var init_submit = __esm({
  "projects/user_pages/app/javascript/lander/submit.ts"() {
    init_define_process();
    init_rebilly_element();
    init_domains();
    init_main();
    $3 = window.$;
    globalThis.processForm = function() {
      return {
        ...getPurchaseForm(),
        ...getContactForm(),
        ...handleMultiCheckboxForm(),
        ...getAppointmentScheduleRequestForm()
      };
    };
    globalThis.submitPage = submitPage;
    lastSubmitTime = 0;
    SUBMIT_COOLDOWN = 1e3;
    globalThis.handleFormSubmit = handleFormSubmit;
    globalThis.setButtonSubmitText = setButtonSubmitText;
    globalThis.restoreButtonState = restoreButtonState;
    globalThis.setRedirectOverride = setRedirectOverride;
    globalThis.clearBlankInputFields = clearBlankInputFields;
    window.addEventListener("DOMContentLoaded", function() {
      mailCheck();
      setupEnterKeySubmit();
      $3(document).on("click", '[href="#submit-form"],[data-element-link="#submit-form"]', function() {
        const $button = $3(this);
        if ($button.closest('[data-page-element="Checkout/V1"]').length == 0) {
          handleFormSubmit($button);
        }
      });
    });
  }
});

// projects/user_pages/app/javascript/lander/rebilly_element.ts
var rebilly_element_exports = {};
__export(rebilly_element_exports, {
  rebillyProcessOrder: () => rebillyProcessOrder
});
function leadSourceGenerator() {
  const DEFAULT_MAX_CHARS_LENGTH = 512;
  const leadQueryParamMapping = {
    utm_source: {
      name: "source"
    },
    utm_medium: {
      name: "medium"
    },
    utm_campaign: {
      name: "campaign"
    },
    utm_term: {
      name: "term"
    },
    utm_content: {
      name: "content"
    },
    affiliate: {},
    subAffiliate: {},
    clickId: {},
    salesAgent: {}
  };
  const params = new URLSearchParams(window.location.search);
  return Array.from(params.keys()).reduce((acc, key) => {
    const mappedValue = leadQueryParamMapping[key];
    if (mappedValue) {
      const paramValue = params.get(key);
      const leadSourceName = mappedValue.name ?? key;
      acc[leadSourceName] = paramValue.substring(0, DEFAULT_MAX_CHARS_LENGTH);
    }
    return acc;
  }, {});
}
var scrollToForm, rebillyProcessOrder;
var init_rebilly_element = __esm({
  "projects/user_pages/app/javascript/lander/rebilly_element.ts"() {
    init_define_process();
    init_submit();
    scrollToForm = () => {
      if (!$(".elPAI").length) return;
      $([document.documentElement, document.body]).animate({ scrollTop: $(".elPAI").offset().top - 50 }, 200);
    };
    globalThis.addEventListener("DOMContentLoad", function() {
      $(document).on("change", ".elInput", function() {
        globalThis.processForm();
      });
      window.addEventListener("payments:token-ready", () => {
        globalThis.processForm();
        if (!checkValidInputs()) {
          restoreButtonState();
          scrollToForm();
          this.window.dispatchEvent(new CustomEvent("payments:submit-failed"));
          return;
        }
        submitPage();
      });
    });
    rebillyProcessOrder = () => {
      const Rebilly = globalThis.Rebilly;
      let extraData = {
        method: globalThis.paymentsSelectedPaymentMethod
      };
      const leadSource = leadSourceGenerator();
      if (Object.keys(leadSource).length) {
        extraData = { ...extraData, leadSource };
      }
      const form = document.querySelector("#cfAR");
      window.dispatchEvent(new CustomEvent("payments:clear-errors"));
      globalThis.processForm();
      if (!checkValidInputs()) {
        restoreButtonState();
        scrollToForm();
        window.dispatchEvent(new CustomEvent("payments:submit-failed"));
        return;
      }
      Rebilly.createToken(form, extraData).then(function(result) {
        console.log("Framepay success", result);
        globalThis.parent.postMessage("success", "*");
        submitPage();
      }).catch(function(error) {
        console.log("Framepay error", error);
        globalThis.parent.postMessage("error", "*");
        form.querySelector('input[data-rebilly="token"]').value = "";
        window.dispatchEvent(
          new CustomEvent("payments:set-token-error", {
            detail: {
              error
            }
          })
        );
        restoreButtonState();
        scrollToForm();
        window.dispatchEvent(new CustomEvent("payments:submit-failed"));
      });
    };
    globalThis.rebillyProcessOrder = rebillyProcessOrder;
    globalThis.scrollToForm = scrollToForm;
  }
});

// projects/user_pages/app/javascript/lander/upsell_element.js
var upsell_element_exports = {};
__export(upsell_element_exports, {
  submitUpsellOrder: () => submitUpsellOrder
});
var submitUpsellOrder;
var init_upsell_element = __esm({
  "projects/user_pages/app/javascript/lander/upsell_element.js"() {
    init_define_process();
    init_submit();
    (function() {
      window.addEventListener("load", function() {
        $(document).on("click", "#upsell-submit-button", function(event) {
          event.preventDefault();
          submitUpsellOrder();
        });
      });
    })();
    submitUpsellOrder = () => {
      $("#cfAR input[data-order-form]").val(true);
      submitPage();
    };
  }
});

// projects/user_pages/app/javascript/lander/order/main.ts
var main_exports = {};
var init_main2 = __esm({
  "projects/user_pages/app/javascript/lander/order/main.ts"() {
    init_define_process();
    (function() {
      window.addEventListener("load", function() {
        const orderCart = window["OrderCart/V1"]?.default;
        let previousRadioProductVariant;
        document.querySelectorAll(".elOrderSelect").forEach(function(orderSelect) {
          const type = orderSelect.getAttribute("data-order-select-type");
          if (type == "single") {
            const firstInput = orderSelect.querySelector('input[type="radio"]');
            if (firstInput) {
              firstInput.checked = true;
            }
            const newProductVariant = orderCart.getProductVariant(firstInput, "single");
            previousRadioProductVariant = newProductVariant;
            orderCart.updateProductVariant(newProductVariant);
          }
        });
        $(document).on("change", '.elOrderSelect input[type="radio"]', function(event) {
          const input = event.target;
          $(`.elOrderSelect input[type="radio"][value=${input.value}]`).prop("checked", true);
          const newProductVariant = orderCart.getProductVariant(input, "single");
          if (previousRadioProductVariant) {
            orderCart.incrementProductVariantQuantity(previousRadioProductVariant, -1);
          }
          orderCart.updateProductVariant(newProductVariant);
          previousRadioProductVariant = newProductVariant;
        });
        $(document).on("change", '.elOrderSelect input[type="number"]', function(event) {
          const input = event.target;
          const productVariantId = input.getAttribute("data-product-variant-id");
          const quantity = input.value;
          $(`.elOrderSelect input[type="number"][data-product-variant-id="${productVariantId}"]`).val(quantity);
          const productVariant = orderCart.getProductVariant(input, "multiple");
          orderCart.updateProductVariant(productVariant);
        });
        $(document).on("change", ".elOrderProductOptionsPrice select", function(event) {
          const priceSelect = event.target;
          const productVariantId = priceSelect.getAttribute("data-product-variant-id");
          const priceId = priceSelect.value;
          const priceCents = priceSelect.querySelector(`option[value="${priceId}"`).getAttribute("data-product-variant-price-cents");
          const orderSelectType = document.querySelector(".elOrderSelect").getAttribute("data-order-select-type");
          const orderSelectInputType = orderSelectType == "single" ? "radio" : "number";
          const productVariantInput = document.querySelector(
            `.elOrderSelect input[type="${orderSelectInputType}"][data-product-variant-id="${productVariantId}"]`
          );
          productVariantInput.setAttribute("data-product-variant-price-id", priceId);
          productVariantInput.setAttribute("data-product-variant-price-cents", priceCents);
          if (orderSelectType == "single" && !productVariantInput.checked) return;
          const productVariant = orderCart.getProductVariant(productVariantInput, orderSelectType);
          orderCart.updateProductVariant(productVariant);
        });
        $(document).on("change", ".elOrderBump input", function(event) {
          const input = event.target;
          const productVariant = orderCart.getProductVariant(input);
          orderCart.updateProductVariant(productVariant);
        });
        $(document).on("change", ".elOrderBump select", function(event) {
          const select = event.target;
          const productId = select.getAttribute("data-product-id");
          const selectedOption = select.querySelector(`option[value="${select.value}"]`);
          const productInput = document.querySelector(
            `.elOrderBump input[data-product-id="${productId}"]`
          );
          const variantAttrs = ["id", "name", "price-id", "price-cents", "price-currency"];
          variantAttrs.forEach(function(variantAttr) {
            productInput.setAttribute(
              `data-product-variant-${variantAttr}`,
              selectedOption.getAttribute(`data-product-variant-${variantAttr}`)
            );
          });
          if (!productInput.checked) return;
          const productVariant = orderCart.getProductVariant(productInput);
          orderCart.updateProductVariant(productVariant);
        });
        $(document).on("click", ".elOrderCoupon button", function() {
          const input = document.querySelector(".elOrderCoupon input");
          orderCart.updateCouponCode(input.value);
        });
        document.querySelectorAll(".elOrderCoupon input[readonly]").forEach(function(element) {
          element.removeAttribute("readonly");
        });
      });
    })();
  }
});

// projects/user_pages/app/javascript/lander/action_link.ts
var action_link_exports = {};
function setupActionLinkListeners() {
  $(document).on("click", "a[href='#print'], [data-element-link='#print']", function() {
    window.print();
    return false;
  });
  $(document).on("click", "[data-element-link='#open-popup'], [href='#open-popup']", function(evt) {
    const checkIfShowHide = evt.target.parentElement.getAttribute("data-elbuttontype");
    if (typeof checkIfShowHide == "undefined" || !["2", "showHide"].includes(checkIfShowHide)) {
      globalThis.CFOpenPopup();
    }
  });
  $(document).on("click", "[data-element-link='#close-popup'], [href='#close-popup']", function() {
    globalThis.CFClosePopup();
  });
  $(document).on("click", "a[href*='#scroll-'], [data-element-link*='#scroll-']", function(evt) {
    const href = evt.currentTarget.getAttribute("href") ?? "";
    const [, id] = href.split("#scroll-");
    if (id) {
      if (isWithinCustomerCenterView()) {
        const el = document.querySelector(`.${id}`);
        const mainElement = window.parent.document.body.querySelector("main");
        if (el && mainElement) {
          mainElement.scrollTo({ top: $(el).offset().top, behavior: "smooth" });
        }
      } else {
        const el = document.querySelector(`.${id}`);
        const popupParent = el?.closest(".modal-wrapper");
        const scrollContainer = popupParent || document.documentElement;
        if (el && scrollContainer) {
          scrollContainer.scrollTo({ top: $(el).offset().top, behavior: "smooth" });
        }
      }
    }
    return false;
  });
  const getElementsIds = (evt, type) => (evt.currentTarget.getAttribute(`data-${type}-button-ids`) || "").split(",").filter((s) => s);
  const performActionOnId = (id, action) => {
    const $el = $(`.${id}`);
    if ($el.attr("data-show-only") && action === "fadeIn") {
      $el.removeAttr("data-show-only");
      $el.css("display", "none");
    }
    $el[action]({ duration: 500 });
  };
  $(document).on("click", "a[href*='#show-hide'], [data-element-link*='#show-hide']", function(evt) {
    evt.preventDefault();
    const hideIds = getElementsIds(evt, "hide");
    const showIds = getElementsIds(evt, "show");
    hideIds.forEach((id) => performActionOnId(id, "fadeOut"));
    showIds.forEach((id) => performActionOnId(id, "fadeIn"));
    return false;
  });
  $(document).on("click", "a[href=''], [data-element-link='']", function(evt) {
    evt.preventDefault();
    return false;
  });
  $(document).on("click", "[data-element-link]", function(evt) {
    evt.preventDefault();
    const linkableElement = evt.currentTarget;
    const link = linkableElement.getAttribute("data-element-link");
    if (link && !internalLinks.includes(link)) {
      const target = linkableElement.getAttribute("target") ?? "_self";
      if (target === "_self") {
        window.location.href = link;
      } else {
        window.open(link, "_blank");
      }
    }
  });
  $(document).on("click", "a[href*='#no-link'], [data-element-link*='#no-link']", function(evt) {
    evt.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("next_funnel_step", "true");
    window.location.href = `${window.location.pathname}?${urlParams}`;
  });
  document.querySelectorAll("[data-element-link]").forEach((linkableElement) => {
    if (linkableElement.getAttribute("data-element-link")) linkableElement.setAttribute("tabindex", "0");
  });
}
var internalLinks;
var init_action_link = __esm({
  "projects/user_pages/app/javascript/lander/action_link.ts"() {
    init_define_process();
    init_cf_utils();
    internalLinks = ["#open-popup", "#close-popup", "#submit-form", "#scroll", "#print", "#show-hide"];
    window.addEventListener("DOMContentLoaded", setupActionLinkListeners);
  }
});

// projects/user_pages/app/javascript/lander/animation.ts
var require_animation = __commonJS({
  "projects/user_pages/app/javascript/lander/animation.ts"() {
    init_define_process();
    var unobserve = (element, observer) => {
      observer.unobserve(element);
      if (element.getAttribute("data-animation-once") !== "true") {
        const time = element.getAttribute("data-animation-time");
        const delay = element.getAttribute("data-animation-delay");
        const timeout = Number(time) + Number(delay);
        setTimeout(() => {
          observer.observe(element);
        }, timeout);
      }
    };
    var startAnimation = (element) => {
      element.setAttribute("data-animation-state", "running");
    };
    var params = new URLSearchParams(window.location.search);
    var disabledAnimations = params.get("animations") == "skip";
    window.addEventListener("DOMContentLoaded", function() {
      if (disabledAnimations) {
        const allAnimatedElements = document.querySelectorAll("[data-animation-type]");
        allAnimatedElements.forEach((el) => {
          el.setAttribute("data-animation-type", "none");
        });
      }
    });
    var setupStyleGuideAnimatedNodes = () => {
      if (disabledAnimations) return;
      const styleGuideAnimationNode = JSON.parse(
        document.getElementById("cf-lander-serialized-style-guide-animation-node")?.textContent ?? "{}"
      );
      document.querySelectorAll("[data-style-guide-animation]").forEach((element) => {
        const style = element.getAttribute("data-style-guide-animation");
        const selectedAnimation = styleGuideAnimationNode.selectors[`.elPageContent [data-style-guide-animation="${style}"]`];
        element.setAttribute("data-animation-type", selectedAnimation.attrs["data-animation-type"]);
        element.setAttribute("data-animation-trigger", selectedAnimation.attrs["data-animation-trigger"]);
      });
    };
    $(document).ready(function() {
      const runAllAnimations = function() {
        setupStyleGuideAnimatedNodes();
        const scrollElements = document.querySelectorAll('[data-animation-trigger="scroll"]');
        const loadElements = document.querySelectorAll('[data-animation-trigger="load"]');
        const config2 = {
          rootMargin: "50px 20px 75px 30px",
          threshold: [0, 0.25, 0.75, 1]
        };
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target.getAttribute("data-animation-state") !== "running") {
                unobserve(entry.target, observer);
                startAnimation(entry.target);
              }
            } else {
              entry.target.setAttribute("data-animation-state", "off");
            }
          });
        }, config2);
        scrollElements.forEach((element) => {
          observer.observe(element);
        });
        loadElements.forEach((element) => {
          startAnimation(element);
        });
      };
      if (!disabledAnimations) runAllAnimations();
    });
  }
});

// projects/user_pages/app/javascript/lander/sticky.ts
var require_sticky = __commonJS({
  "projects/user_pages/app/javascript/lander/sticky.ts"() {
    init_define_process();
    function cloneSticky(sticky) {
      const stickyClone = sticky.clone(true, true).addClass("stickyClone");
      sticky.parent().append(stickyClone);
      globalThis.CF2Component.hydrateTree(stickyClone.get(0));
    }
    $(document).ready(function() {
      const $stickyElements = $(".stickyTop");
      $stickyElements.each((_index, element) => {
        const sticky = $(element);
        let cloned = false;
        let scrollTop = $(window).scrollTop();
        let stickyTop = sticky.offset().top;
        if (scrollTop > stickyTop) {
          cloneSticky(sticky);
          cloned = true;
        }
        document.addEventListener("scroll", () => {
          scrollTop = $(window).scrollTop();
          stickyTop = sticky.offset().top;
          if (scrollTop >= stickyTop && !cloned) {
            cloneSticky(sticky);
            cloned = true;
          }
          if (scrollTop < stickyTop && cloned) {
            sticky.parent().find("> .stickyClone").remove();
            cloned = false;
          }
        });
      });
    });
  }
});

// projects/user_pages/app/javascript/lander.js
var require_lander = __commonJS({
  "projects/user_pages/app/javascript/lander.js"() {
    init_define_process();
    require_replace_tag();
    init_fetcher();
    require_parseurl();
    require_audio_player();
    require_garlic_cf();
    init_populate_select();
    require_runtime_events();
    init_fhl_handle_select_transformation();
    init_track_events();
    init_resource_sharing_concern();
    init_rebilly_element();
    init_upsell_element();
    init_main2();
    init_runtime();
    init_action_link();
    require_animation();
    init_submit();
    require_sticky();
    window.nanostores = (init_nanostores(), __toCommonJS(nanostores_exports));
    var originalFetch = window.fetch;
    window.inflightRequests = 0;
    window.fetch = async (request, init) => {
      window.inflightRequests++;
      try {
        const rendered_page_url = document.querySelector('meta[name="rendered-page-url"]')?.getAttribute("content");
        if (rendered_page_url) {
          const url = new URL(new Request(request).url);
          if (url.hostname == window.location.hostname) {
            init = init || {};
            if (!init.headers) init.headers = {};
            init.headers["X-Rendered-Page-Url"] = rendered_page_url;
          }
        }
      } catch (e) {
        console.error("Failed to set X-Rendered-Page-Url header", e);
      }
      return originalFetch(request, init).finally(() => {
        window.inflightRequests--;
      });
    };
    $(window).on("DOMContentLoaded", function() {
      $('.elFormItem:not([data-prevent-garlic="true"])').each(function() {
        let onPersist = () => {
        };
        if (this.getAttribute("name") == "name") {
          onPersist = () => {
            const value = this.value.trim();
            const firstName = value.split(" ")[0];
            const lastName = value.split(" ").slice(1).join(" ");
            window.cfGarlicUtils.store("first_name", firstName);
            window.cfGarlicUtils.store("last_name", lastName);
          };
        } else if (this.getAttribute("name") == "phone_number") {
          onPersist = () => {
            if (!this.iti?.isValidNumber()) return;
            const value = this.iti?.getNumber() ?? this.value.trim();
            window.cfGarlicUtils.store("phone_number", value);
          };
        }
        $(this).garlic({
          onPersist,
          onRetrieve: function($el, retrievedValue) {
            const elemName = $el.attr("name");
            globalThis.CFGarlicValues[elemName] = retrievedValue;
            $el.each((_, element) => {
              const closestBlueprintInstance = element.closest("[data-page-element]")?.cf2_instance;
              if (closestBlueprintInstance && closestBlueprintInstance.update) {
                closestBlueprintInstance.update(retrievedValue);
              }
            });
          }
        });
      });
    });
  }
});

// projects/shared/stylesheets/page-content/main.scss
var init_main3 = __esm({
  "projects/shared/stylesheets/page-content/main.scss"() {
  }
});

// projects/shared/stylesheets/bootstrap-modal.min.css
var init_bootstrap_modal_min = __esm({
  "projects/shared/stylesheets/bootstrap-modal.min.css"() {
  }
});

// projects/user_pages/app/stylesheets/core.css
var init_core = __esm({
  "projects/user_pages/app/stylesheets/core.css"() {
  }
});

// projects/user_pages/app/stylesheets/mediaelementplayer-custom.css
var init_mediaelementplayer_custom = __esm({
  "projects/user_pages/app/stylesheets/mediaelementplayer-custom.css"() {
  }
});

// projects/user_pages/app/stylesheets/alert_messages.scss
var init_alert_messages = __esm({
  "projects/user_pages/app/stylesheets/alert_messages.scss"() {
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/dist/systemBluprints.min.css
var init_systemBluprints_min = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/dist/systemBluprints.min.css"() {
  }
});

// projects/user_pages/app/javascript/lander_styles.js
var lander_styles_exports = {};
var init_lander_styles = __esm({
  "projects/user_pages/app/javascript/lander_styles.js"() {
    init_define_process();
    init_main3();
    init_bootstrap_modal_min();
    init_core();
    init_mediaelementplayer_custom();
    init_alert_messages();
    init_systemBluprints_min();
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/content-node.ts
var ContentNode;
var init_content_node = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/content-node.ts"() {
    init_define_process();
    init_runtime();
    ContentNode = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount(el) {
        this.syncSameNameInputs();
      }
      syncSameNameInputs() {
        const formInputs = document.querySelectorAll(".elFormItem[name]");
        formInputs.forEach((input) => {
          const inputName = input.name;
          input.addEventListener("change", () => {
            if (input.type === "checkbox" || input.type === "radio") {
              const inputValue = input.value;
              const otherInputs = document.querySelectorAll(
                `.elFormItem.elInput[name="${inputName}"][value="${inputValue}"]`
              );
              otherInputs.forEach((otherInput) => {
                otherInput.checked = input.checked;
              });
            } else {
              const otherInputs = document.querySelectorAll(
                `.elFormItem.elInput[name="${inputName}"]`
              );
              otherInputs.forEach((otherInput) => {
                otherInput.value = input.value;
              });
            }
          });
        });
      }
    };
    registerComponent("ContentNode", ContentNode);
    window["ContentNode"] = ContentNode;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/modal-container-v1.ts
var ModalContainerV1;
var init_modal_container_v1 = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/modal-container-v1.ts"() {
    init_define_process();
    init_modal_v1();
    init_runtime();
    ModalContainerV1 = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount() {
        this.isAudioInitialized = false;
        this.modal = this.getComponent("Modal/V1");
        this.videoElements = this.getComponents("Video/V1");
        this.modalElement = this.modal.element;
        this.containerModal = document.getElementById("modalPopup");
        this.showOnExit = this.containerModal.getAttribute("data-show-popup-on-exit") === "true";
        this.showOnLoad = this.containerModal.getAttribute("data-show-popup-on-page-load") === "true";
        this.showWhenElementIsVisible = this.element.getAttribute("data-selected-element");
        this.closeButton = this.element.querySelector(".closeLPModal");
        if (this.showWhenElementIsVisible) {
          const visibleElementSelector = this.showWhenElementIsVisible.startsWith("id-") ? `.${this.showWhenElementIsVisible}` : `.id-${this.showWhenElementIsVisible}`;
          this.visibleElement = document.querySelector(visibleElementSelector);
        }
        const self = this;
        this.modal.close = function() {
          handleModalClose();
        };
        if (this.visibleElement) {
          handleShowWhenElementIsVisible(this.visibleElement);
        }
        if (this.showOnExit) {
          handleShowOnExit();
        }
        if (this.showOnLoad) {
          if (this.showOnLoadDelay) {
            setTimeout(() => {
              handleModalOpen();
            }, this.showOnLoadDelay);
          } else {
            handleModalOpen();
          }
        }
        function handleModalOpen() {
          const containerModal = self.containerModal;
          const modalElement = self.modalElement;
          const closeButton = self.closeButton;
          const scrollY = window.scrollY;
          $(containerModal).show();
          $(containerModal).css("top", -800);
          $(closeButton).css("top", -800);
          $(containerModal).addClass("popup-relative-position");
          $("html").addClass("hide-page-scroll");
          $("body").css("position", "fixed");
          $("body").css("top", `-${scrollY}px`);
          $("body").css("width", "100%");
          $(modalElement).show();
          if (!self.isAudioInitialized) {
            self.isAudioInitialized = true;
            setupAudioElements();
          }
          $(modalElement).css({
            opacity: 1,
            top: 0
          });
          $(containerModal).animate(
            {
              opacity: 1,
              top: 0
            },
            {
              duration: 200
            }
          );
          $(closeButton).animate({ top: -20 }, { duration: 200 });
        }
        function handleModalClose() {
          const containerModal = self.containerModal;
          const modalElement = self.modalElement;
          const closeButton = self.closeButton;
          const scrollY = $("body").css("top");
          $(closeButton).animate({ top: -800 }, { duration: 200 });
          $(containerModal).animate(
            {
              opacity: 0,
              top: -800
            },
            {
              duration: 200,
              complete: function() {
                $(modalElement).css({
                  opacity: 0,
                  top: -800
                });
                $(modalElement).hide();
                $(containerModal).hide();
                $(containerModal).removeClass("popup-relative-position");
              }
            }
          );
          $("html").removeClass("hide-page-scroll");
          $("body").css("position", "");
          $("body").css("top", "");
          $("body").css("width", "");
          if (scrollY) {
            window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
          }
        }
        function handleShowWhenElementIsVisible() {
          const config2 = {
            rootMargin: "50px 20px 75px 30px",
            threshold: [0, 0.25, 0.75, 1]
          };
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.unobserve(entry.target, observer);
                handleModalOpen();
              }
            });
          }, config2);
          observer.observe(self.visibleElement);
        }
        function handleShowOnExit() {
          let cfMouseP = 0;
          const modalElement = self.modalElement;
          const handleMouseMove = (evt) => {
            cfMouseP = evt.clientY;
          };
          const handleMouseLeave = () => {
            if (cfMouseP <= 40) {
              if (!$(modalElement).is(":visible")) {
                handleModalOpen();
                document.querySelector("body").removeEventListener("mouseleave", handleMouseLeave);
                document.querySelector("body").removeEventListener("mousemove", handleMouseMove);
              }
            }
          };
          document.querySelector("body").addEventListener("mousemove", handleMouseMove);
          document.querySelector("body").addEventListener("mouseleave", handleMouseLeave);
        }
        function setupAudioElements() {
          const audioElements = $(".containerModal .elAudioWrapper");
          try {
            audioElements.each(function() {
              const $this = $(this);
              const audioURL = $this.attr("data-audio-url") || "https://images.clickfunnels.com/images/SevenNationArmy.mp3";
              const loop = $this.attr("data-audio-loop") || "no";
              const playerOptions = {
                class: "elAudioElement",
                audioWidth: "100%",
                audioHeight: "100%",
                enableAutosize: true,
                enableProgressTooltip: false,
                loop: loop === "yes",
                features: [
                  "playpause",
                  "current",
                  "progress",
                  "duration",
                  "volume"
                ]
              };
              const audio = $(this).find("audio");
              audio.attr("src", audioURL);
              audio.mediaelementplayer(playerOptions);
            });
          } catch (err) {
            console.log(err);
          }
        }
        globalThis.CFOpenPopup = handleModalOpen;
        globalThis.CFClosePopup = handleModalClose;
      }
    };
    registerComponent("ModalContainer/V1", ModalContainerV1);
    window["ModalContainerV1"] = ModalContainerV1;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/add-to-cart.ts
var AddToCart;
var init_add_to_cart = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/add-to-cart.ts"() {
    init_define_process();
    init_addToCart();
    init_runtime();
    AddToCart = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount() {
        mountComponent(this);
      }
      remove() {
        this.element.innerHTML = "";
      }
      render(initializeChildrenInstances = false) {
        const is_server = true;
        const product = this.product ?? null;
        const currentVariant = this.currentVariant ?? null;
        const selected_price = this.selected_price ?? null;
        const button_layout_size = this.button_layout_size ?? null;
        const input_layout_size = this.input_layout_size ?? null;
        const show_name = this.show_name ?? null;
        const show_description = this.show_description ?? null;
        const show_compare_at = this.show_compare_at ?? null;
        const editor_product = this.element.getAttribute("data-param-editor_product");
        const primary_text = this.element.getAttribute("data-param-primary_text");
        const secondary_text = this.element.getAttribute("data-param-secondary_text");
        let html = "";
        {
          const is_editor = false;
          const customVariants = product?.variants.filter((value) => value["default_variant"] == false);
          const variant = currentVariant ?? product;
          const selected_price2 = variant?.prices?.[0];
          const desc = (product?.description_override ?? variant.description ?? product.description ?? product.default_variant.description ?? "").replaceAll(`
`, "<br>");
          html += `<div class="elAddToCartWrapper">`;
          if (show_name) {
            html += `<a class="elAddToCartNameLink" href="${product?.url}"><span class="elAddToCartName">${variant?.name ?? product.default_variant.name}</span></a>`;
          }
          if (variant?.prices?.length == 1) {
            html += `<div class="elAddToCartSinglePriceWrapper"><span class="elAddToCartPrice">${selected_price2?.name}</span>`;
            const compare_at_amount = selected_price2?.compare_at_amount;
            if (compare_at_amount && show_compare_at) {
              html += `<span class="elAddToCartCompareAt">${compare_at_amount}</span>`;
            }
            html += `</div>`;
          } else {
            html += `<div class="elSelectWrapper`;
            if (input_layout_size == "xs") {
              html += ` elAddToCartInputExtraSmall`;
            }
            if (input_layout_size == "s") {
              html += ` elAddToCartInputSmall`;
            }
            if (input_layout_size == "m") {
              html += ` elAddToCartInputMedium`;
            }
            if (input_layout_size == "l") {
              html += ` elAddToCartInputLarge`;
            }
            if (input_layout_size == "xl") {
              html += ` elAddToCartInputExtraLarge`;
            }
            html += `"><select name="variant_price">`;
            const c0 = variant.prices;
            const fl1 = new CF2ForloopDrop(c0.length);
            for (const price of c0) {
              const forloop = fl1;
              html += `<option `;
              if (selected_price2?.id == price?.id) {
                html += `selected`;
              }
              html += ` value="${price?.id}">${price?.name}</option>`;
              forloop.next();
            }
            html += `</select><div class="elSelectArrow"><i class="fas fa-chevron-down"></i></div></div>`;
          }
          if (desc != "" && show_description) {
            html += `<span class="elAddToCartDescription">${desc}</span>`;
          }
          if (customVariants?.length > 1) {
            html += `<div class="elAddToCartVariantSelectorWrapper">`;
            const c2 = product.sorted_property_values;
            const fl3 = new CF2ForloopDrop(c2.length);
            for (const property_values of c2) {
              const forloop = fl3;
              const property_id = property_values?.property_id;
              const select_index = forloop?.index0;
              html += `<div class="elSelectWrapper`;
              if (input_layout_size == "xs") {
                html += ` elAddToCartInputExtraSmall`;
              }
              if (input_layout_size == "s") {
                html += ` elAddToCartInputSmall`;
              }
              if (input_layout_size == "m") {
                html += ` elAddToCartInputMedium`;
              }
              if (input_layout_size == "l") {
                html += ` elAddToCartInputLarge`;
              }
              if (input_layout_size == "xl") {
                html += ` elAddToCartInputExtraLarge`;
              }
              html += `"><span class="elAddToCartVariantSelectorTitle">${product?.all_properties?.[property_id]}</span><div style="position:relative;"><select class="elVariantSelector" name="property_${property_id}">`;
              const c4 = property_values.value_ids;
              const fl5 = new CF2ForloopDrop(c4.length);
              for (const value_id of c4) {
                const forloop2 = fl5;
                html += `<option `;
                if (variant?.property_value_ids?.[select_index] == value_id) {
                  html += `selected`;
                }
                html += ` value="${value_id}">${product?.all_properties_values?.[value_id]}</option>`;
                forloop2.next();
              }
              html += `</select><div class="elSelectArrow"><i class="fas fa-chevron-down"></i></div></div></div>`;
              forloop.next();
            }
            html += `</div>`;
          }
          html += `<div class="elAddToCartButtonsWrapper"><div data-page-element="Button/V1" class="elBTN elAddToCartAddToCartButton id-Button/V1`;
          if (button_layout_size == "xs") {
            html += ` elAddToCartButtonExtraSmall`;
          }
          if (button_layout_size == "s") {
            html += ` elAddToCartButtonSmall`;
          }
          if (button_layout_size == "m") {
            html += ` elAddToCartButtonMedium`;
          }
          if (button_layout_size == "l") {
            html += ` elAddToCartButtonLarge`;
          }
          if (button_layout_size == "xl") {
            html += ` elAddToCartButtonExtraLarge`;
          }
          html += `" data-liquid-replace="item">`;
          const label_key = "addtocart";
          const label_key_slice = "addtoc";
          let data_content_key = "";
          data_content_key = "addtocart";
          html += `<a target="_self" href="#add-to-cart" class="elButton" aria-label="" data-disabled="false" data-show-button-ids="" data-hide-button-ids="" data-on-submit-go-to="" data-param-submittingText="Submitting..." data-content="" data-style-guide-button="" rel="noopener"><span class="elButtonMain"><i class="fas fa-spinner fa-spin elButtonSpinner elButtonText"></i><span class="elButtonMainText elButtonText">${primary_text}</span></span><span class="elButtonSub"></span></a></div></div></div>`;
        }
        this.replaceContent(html);
        if (initializeChildrenInstances) {
          const scopeToYggRender = this.element.querySelectorAll("[ygg-render]").length > 0;
          const options = { scopeToYggRender };
          CF2Component.hydrateTree(this.element, options);
        }
      }
    };
    registerComponent("AddToCart", AddToCart);
    window["AddToCart"] = AddToCart;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/store-search-products.ts
var StoreSearchProducts;
var init_store_search_products = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/store-search-products.ts"() {
    init_define_process();
    init_runtime();
    StoreSearchProducts = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount() {
      }
      remove() {
        this.element.innerHTML = "";
      }
      render(initializeChildrenInstances = false) {
        const is_server = true;
        const selected_products = this.selected_products ?? null;
        let html = "";
        {
          const c0 = selected_products;
          const fl1 = new CF2ForloopDrop(c0.length);
          for (const product of c0) {
            const forloop = fl1;
            const default_variant = product?.default_variant ?? "{}";
            const image = product?.image ?? default_variant.image ?? "/editor/editor-demo-image-placeholder.svg";
            const name = product?.name ?? default_variant.name;
            const price = product?.price ?? default_variant.price;
            html += `<div class="elStoreSearchProductCard">`;
            if (image) {
              html += `<a class="elStoreSearchImageWrapper" href="${product?.url}"><div data-page-element="Image/V2" class="elImageWrapper de-image-block id-Image/V2`;
              if (CF2Blank(image) && CF2Blank(null) && true) {
                html += ` forceHide`;
              }
              html += `" data-liquid-replace="item">`;
              if (image || !CF2Blank(null)) {
                html += `<img class="elImage" src="${image ?? null}" data-lazy-loading="true" data-lazy-loading="true"/>`;
              } else if (false) {
                html += `<div class="image-placeholder" title=""><span class="image-placeholder-header"></span></div>`;
              }
              html += `</div></a>`;
            }
            html += `<div class="elStoreSearchProductCardInfo"><a href="${product?.url}" class="elStoreSearchProductCardName">${name}</a><span class="elStoreSearchProductCardPrice">${price}</span></div></div>`;
            forloop.next();
          }
        }
        this.replaceContent(html);
        if (initializeChildrenInstances) {
          const scopeToYggRender = this.element.querySelectorAll("[ygg-render]").length > 0;
          const options = { scopeToYggRender };
          CF2Component.hydrateTree(this.element, options);
        }
      }
    };
    registerComponent("StoreSearchProducts", StoreSearchProducts);
    window["StoreSearchProducts"] = StoreSearchProducts;
  }
});

// projects/lib/packages/yggdrasil-blueprints/src/Elements/Store/Search/storeSearch.ts
var allProductsById, productSearchFetcher, fetchProducts, handleSearchResults, searchProducts, debounceHandler, mountComponent2, getProductsElementComponent, updateProducts, showModal, productsReady, hideModal, showSearchProducts, hideProducts, hideTitle, showTitle, showResultsNotFound, hideResultsNotFound, showLoading, hideLoading;
var init_storeSearch = __esm({
  "projects/lib/packages/yggdrasil-blueprints/src/Elements/Store/Search/storeSearch.ts"() {
    init_define_process();
    init_general();
    init_fetcher();
    allProductsById = {};
    fetchProducts = (component, searchQuery) => {
      if (productSearchFetcher) {
        productSearchFetcher.abort();
      }
      const url = new URL("/products/search", window.location.origin);
      url.searchParams.set("q", searchQuery);
      productSearchFetcher = new Fetcher();
      return productSearchFetcher.fetch(
        url.toString(),
        {
          headers: { "Content-Type": "application/json" }
        },
        { retries: 3, shouldCaptureServerError: true }
      ).then((res) => {
        if (res instanceof Response && res.ok) {
          return res.json();
        }
        throw new Error("Search request failed");
      }).then((json) => {
        const products = json.products;
        if (!products) return;
        handleSearchResults(component, products, searchQuery);
      }).catch((error) => {
        if (error === MANUALLY_ABORTED) {
          return;
        }
        console.error("Product search error:", error);
      }).finally(() => {
        productSearchFetcher = null;
        hideLoading(component);
      });
    };
    handleSearchResults = (component, products, searchQuery) => {
      hideLoading(component);
      if (products.length > 0) {
        updateProducts(component, products);
        hideTitle(component);
        showSearchProducts(component);
        hideResultsNotFound(component);
      } else {
        hideProducts(component);
        hideTitle(component);
        showResultsNotFound(component, searchQuery);
      }
    };
    searchProducts = (search, component) => {
      showLoading(component);
      fetchProducts(component, search);
    };
    debounceHandler = debounce(
      ([evt, component]) => searchProducts(evt.target.value, component),
      500
    );
    mountComponent2 = (component) => {
      showTitle(component);
      productsReady(component);
      const searchIcon = component.element.querySelector('[href="#open-store-search"]');
      searchIcon.addEventListener("click", () => showModal(component));
      const searchElement = component.element.querySelector('[name="store-search"]');
      searchElement.addEventListener("input", (evt) => debounceHandler(evt, component));
      searchElement.addEventListener("focus", (evt) => debounceHandler(evt, component));
      const modal = component.getComponent("Modal/V1");
      modal.element.addEventListener("click", () => {
        hideModal(component);
      });
      component.element.querySelector(".elStoreSearch").addEventListener("click", (evt) => {
        evt.stopPropagation();
      });
      component.element.querySelectorAll(".elModalClose").forEach(
        (elem) => elem.addEventListener("click", () => {
          hideModal(component);
        })
      );
      document.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape") hideModal(component);
      });
    };
    getProductsElementComponent = (component) => {
      return component.getComponent("StoreSearchProducts");
    };
    updateProducts = (component, products) => {
      ;
      getProductsElementComponent(component).selected_products = products;
      getProductsElementComponent(component).render();
    };
    showModal = (component) => {
      document.documentElement.classList.add("hide-page-scroll");
      component.getComponent("Modal/V1").element.style.display = "flex";
      component.element.querySelector(".elStoreSearch").setAttribute("data-animation-state", "running");
      component.element.querySelector('[name="store-search"]').focus();
    };
    productsReady = (component) => {
      updateProducts(component, Object.values(allProductsById).slice(0, 6));
      getProductsElementComponent(component).element.classList.remove("forceHide");
      component.element.querySelector(".elStoreSearchTitle").classList.remove("forceHide");
      component.element.querySelector('[name="store-search"]').disabled = false;
      component.element.querySelector(".elStoreSearchLoading").classList.add("forceHide");
    };
    hideModal = (component) => {
      document.documentElement.classList.remove("hide-page-scroll");
      component.getComponent("Modal/V1").element.style.display = "none";
    };
    showSearchProducts = (component) => {
      getProductsElementComponent(component).element.classList.remove("forceHide");
    };
    hideProducts = (component) => {
      getProductsElementComponent(component).element.classList.add("forceHide");
    };
    hideTitle = (component) => {
      component.element.querySelector(".elStoreSearchTitle").classList.add("forceHide");
    };
    showTitle = (component) => {
      component.element.querySelector(".elStoreSearchTitle").classList.remove("forceHide");
    };
    showResultsNotFound = (component, text) => {
      const [split1, split2] = component.not_found_text.split("{search}");
      component.element.querySelector(".elStoreSearchResultsNotFound").innerHTML = split1 + text + split2;
      component.element.querySelector(".elStoreSearchResultsNotFound").classList.remove("forceHide");
    };
    hideResultsNotFound = (component) => {
      component.element.querySelector(".elStoreSearchResultsNotFound").classList.add("forceHide");
    };
    showLoading = (component) => {
      component.element.querySelector(".elStoreSearchLoading").classList.remove("forceHide");
    };
    hideLoading = (component) => {
      component.element.querySelector(".elStoreSearchLoading").classList.add("forceHide");
    };
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/store-search.ts
var StoreSearch;
var init_store_search = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/store-search.ts"() {
    init_define_process();
    init_modal_v1();
    init_store_search_products();
    init_storeSearch();
    init_runtime();
    StoreSearch = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount() {
        mountComponent2(this);
      }
    };
    registerComponent("StoreSearch", StoreSearch);
    window["StoreSearch"] = StoreSearch;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/accordion-v1.ts
var AccordionV1;
var init_accordion_v1 = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/accordion-v1.ts"() {
    init_define_process();
    init_runtime();
    AccordionV1 = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      mount() {
        const allAccordionElements = this.element.querySelector(".elAccordionWrapper").childNodes;
        const bodySelector = ".elAccordionItemBody";
        const openClass = "elAccordionItemOpen";
        const closeClass = "elAccordionItemClosing";
        allAccordionElements.forEach((accordion) => {
          const header = accordion.querySelector(".elAccordionItemHeader");
          const body = accordion.querySelector(bodySelector);
          header.addEventListener("click", () => {
            const isOpen = accordion.classList.contains(openClass);
            if (isOpen) {
              accordion.classList.add(closeClass);
              $(body).slideUp(300, () => {
                accordion.classList.remove(openClass);
                accordion.classList.remove(closeClass);
              });
            } else {
              accordion.classList.add(openClass);
              $(body).slideDown(300);
            }
            allAccordionElements.forEach((otherAccordion) => {
              if (otherAccordion === accordion) return;
              const body2 = otherAccordion.querySelector(bodySelector);
              otherAccordion.classList.add(closeClass);
              $(body2).slideUp(300, () => {
                otherAccordion.classList.remove(openClass);
                otherAccordion.classList.remove(closeClass);
              });
            });
          });
        });
      }
    };
    registerComponent("Accordion/V1", AccordionV1);
    window["AccordionV1"] = AccordionV1;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/checkout-product-image-carousel-v1.ts
var CheckoutProductImageCarouselV1;
var init_checkout_product_image_carousel_v1 = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/checkout-product-image-carousel-v1.ts"() {
    init_define_process();
    init_runtime();
    CheckoutProductImageCarouselV1 = class extends CF2Component {
      constructor(el, runtimeSel) {
        super(el, runtimeSel);
      }
      selectProduct(productId, variantId) {
        const changedProduct = productId != this.currentProduct?.id;
        if (changedProduct) {
          this.currentVariantId = variantId;
          this.currentProduct = globalResourceData.productsById[productId];
          this.render();
          this.calculateTotalThumbnails();
          this.mountSlider();
          this.scrollToVariant(true);
        }
        const changedVariant = variantId != this.currentVariantId;
        if (changedVariant) {
          this.currentVariantId = variantId;
          this.scrollToVariant(changedProduct);
        }
      }
      initialize() {
        document.addEventListener("ProductCarousel:Update", (evt) => {
          const { productId, variantId } = evt.detail;
          this.selectProduct(productId, variantId);
        });
      }
      calculateTotalThumbnails() {
        this.totalImages = this.element.querySelectorAll(".slider-nav .swiper-slide").length;
      }
      scrollToVariant(disableAnimation = false) {
        const variantImages = this.element.querySelectorAll(`.slider-nav [data-variant-id="${this.currentVariantId}"]`);
        const productImages = this.element.querySelectorAll(".slider-nav .swiper-slide:not([data-variant-id])");
        const itemImages = variantImages.length ? variantImages : productImages;
        if (itemImages.length) {
          const itemPositions = [...itemImages].map((item) => item.getAttribute("data-image-position"));
          const firstPosition = itemPositions[0];
          const lastPosition = itemPositions[itemPositions.length - 1];
          const speed = disableAnimation ? 0 : void 0;
          if (this.swiperNav) {
            this.swiperNav.setProgress(firstPosition / (this.totalImages - this.numberOfThumbnails), speed);
          }
          this.swiper.slideTo(firstPosition, speed);
        }
      }
      mountSlider() {
        const mainSliderEl = this.element.querySelector(".slider-main");
        const navSliderEl = this.element.querySelector(".slider-nav");
        const hasThumbnails = !!this.element.querySelector(".slider-nav");
        const hasNextPrevButtons = !!this.element.querySelector(".swiper-button-next, .swiper-button-prev");
        this.swiperNav = null;
        if (hasThumbnails) {
          this.swiperNav = new Swiper(navSliderEl, {
            spaceBetween: this.spaceBetweenThumbnails,
            slidesPerView: this.numberOfThumbnails,
            freeMode: true,
            watchSlidesProgress: true,
            mousewheel: true,
            scrollbar: {
              el: ".swiper-scrollbar",
              draggable: true
            }
          });
        }
        this.swiper = new Swiper(mainSliderEl, {
          spaceBetween: 1,
          loop: true,
          ...hasNextPrevButtons ? {
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev"
            }
          } : {},
          ...hasThumbnails ? {
            thumbs: {
              swiper: this.swiperNav
            }
          } : {}
        });
      }
      remove() {
        this.element.innerHTML = "";
      }
      render(initializeChildrenInstances = false) {
        const is_server = true;
        const currentProduct = this.currentProduct ?? null;
        const numberOfThumbnails = this.numberOfThumbnails ?? null;
        const spaceBetweenThumbnails = this.spaceBetweenThumbnails ?? null;
        const showThumbnails = this.element.getAttribute("data-param-showThumbnails");
        const linkedCheckoutId = this.element.getAttribute("data-param-linkedCheckoutId");
        let html = "";
        {
          let assignedProduct = currentProduct;
          html += `<div class="elProductImageCarouselOuterFrame"></div>`;
          const is_editor = false;
          let warning = "";
          if (CF2Blank(assignedProduct)) {
            assignedProduct = globalResourceData?.productsWithNoBump?.[0];
          }
          let imagePosition = 0;
          const variantImages = assignedProduct?.variants.map((i) => i.images).flat();
          const allImages = assignedProduct?.images.concat(variantImages).filter((v) => v != null && v != void 0);
          const totalImages = allImages?.length ?? 0;
          html += `<div style="--widget-tooltip-message-bottom:0px;--number-of-thumbnails:${numberOfThumbnails};--space-between-thumbnails:${spaceBetweenThumbnails};--total-images:${totalImages};" class="elCheckoutProductImageCarouselContainer" data-widget-tooltip-message="">`;
          if (totalImages > 0) {
            html += `<div class="slider-main-wrapper"><div class="elProductCarouselMainImageOuterFrame"></div><div class="swiper slider-main"><div class="swiper-wrapper">`;
            imagePosition = 0;
            if (assignedProduct?.images?.length > 0) {
              const c0 = assignedProduct.images;
              const fl1 = new CF2ForloopDrop(c0.length);
              for (const imageUrl of c0) {
                const forloop = fl1;
                html += `<div class="swiper-slide`;
                if (imagePosition == 0 && false) {
                  html += ` swiper-slide-thumb-active`;
                }
                html += `" data-image-position="${imagePosition}"><img src="${imageUrl}"/></div>`;
                imagePosition = imagePosition + 1;
                forloop.next();
              }
            }
            const c2 = assignedProduct.variants;
            const fl3 = new CF2ForloopDrop(c2.length);
            for (const variant of c2) {
              const forloop = fl3;
              if (variant?.images?.length > 0) {
                const c4 = variant.images;
                const fl5 = new CF2ForloopDrop(c4.length);
                for (const imageUrl of c4) {
                  const forloop2 = fl5;
                  html += `<div class="swiper-slide`;
                  if (imagePosition == 0 && false) {
                    html += ` swiper-slide-thumb-active`;
                  }
                  html += `" data-image-position="${imagePosition}" data-variant-id="${variant?.id}"><img src="${imageUrl}"/></div>`;
                  imagePosition = imagePosition + 1;
                  forloop2.next();
                }
              }
              forloop.next();
            }
            html += `</div>`;
            if (totalImages > 1) {
              html += `<div class="swiper-button-next"></div>`;
              html += `<div class="swiper-button-prev"></div>`;
            }
            html += `</div></div>`;
            if (showThumbnails && totalImages > 1) {
              html += `<div class="slider-nav-wrapper"><div class="swiper slider-nav"><div class="swiper-wrapper">`;
              imagePosition = 0;
              if (assignedProduct?.images?.length > 0) {
                const c6 = assignedProduct.images;
                const fl7 = new CF2ForloopDrop(c6.length);
                for (const imageUrl of c6) {
                  const forloop = fl7;
                  html += `<div class="swiper-slide`;
                  if (imagePosition == 0 && true) {
                    html += ` swiper-slide-thumb-active`;
                  }
                  html += `" data-image-position="${imagePosition}"><img src="${imageUrl}"/></div>`;
                  imagePosition = imagePosition + 1;
                  forloop.next();
                }
              }
              const c8 = assignedProduct.variants;
              const fl9 = new CF2ForloopDrop(c8.length);
              for (const variant of c8) {
                const forloop = fl9;
                if (variant?.images?.length > 0) {
                  const c10 = variant.images;
                  const fl11 = new CF2ForloopDrop(c10.length);
                  for (const imageUrl of c10) {
                    const forloop2 = fl11;
                    html += `<div class="swiper-slide`;
                    if (imagePosition == 0 && true) {
                      html += ` swiper-slide-thumb-active`;
                    }
                    html += `" data-image-position="${imagePosition}" data-variant-id="${variant?.id}"><img src="${imageUrl}"/></div>`;
                    imagePosition = imagePosition + 1;
                    forloop2.next();
                  }
                }
                forloop.next();
              }
              html += `</div></div><div class="swiper-scrollbar swiper-scrollbar-horizontal"></div></div>`;
            }
          }
          html += `</div>`;
        }
        this.replaceContent(html);
        if (initializeChildrenInstances) {
          const scopeToYggRender = this.element.querySelectorAll("[ygg-render]").length > 0;
          const options = { scopeToYggRender };
          CF2Component.hydrateTree(this.element, options);
        }
      }
    };
    registerComponent("CheckoutProductImageCarousel/V1", CheckoutProductImageCarouselV1);
    window["CheckoutProductImageCarouselV1"] = CheckoutProductImageCarouselV1;
  }
});

// projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/sharedModules.ts
var sharedModules_exports = {};
var init_sharedModules = __esm({
  "projects/lib/packages/yggdrasil-blueprints/__generated__/blueprints/sharedModules.ts"() {
    init_define_process();
    init_content_node();
    init_modal_v1();
    init_modal_sidebar_v1();
    init_modal_container_v1();
    init_select_box_v2();
    init_checkbox_v1();
    init_input_v1();
    init_radio_v1();
    init_text_area_v1();
    init_add_to_cart();
    init_store_search_products();
    init_store_search();
    init_accordion_v1();
    init_checkout_product_image_carousel_v1();
    init_survey_image_option_v1();
  }
});

// projects/user_pages/app/packs/user_pages.js
init_define_process();
require_lander();
init_lander_styles();
init_sharedModules();
//# sourceMappingURL=user_pages-CCDMTGRN.js.map
