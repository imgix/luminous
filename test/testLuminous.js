import Luminous from "../src/js/Luminous";

beforeEach(function() {
  let anchor = document.createElement("a");
  anchor.href = "http://website.com/image.png";
  anchor.classList.add("test-anchor");

  document.body.appendChild(anchor);
});

afterEach(function() {
  let anchor = document.querySelector(".test-anchor");

  document.body.removeChild(anchor);
});

describe("Core", () => {
  it("throws if no arguments are passed", () => {
    expect(() => {
      new Luminous();
    }).toThrowError(
      TypeError,
      "`new Luminous` requires a DOM element as its first argument."
    );
  });

  it("throws if the first argument is not a DOM element", () => {
    expect(() => {
      new Luminous(".some-selector");
    }).toThrowError(
      TypeError,
      "`new Luminous` requires a DOM element as its first argument."
    );
  });

  it("returns an instance of `Luminous` when correctly instantiated", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor);

    expect(lum.constructor).toBe(Luminous);
  });

  it("executes the `onOpen` callback when present", () => {
    let called = false;
    function openCallback() {
      called = true;
    }

    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor, { onOpen: openCallback });

    lum.open();
    expect(called).toBe(true);
  });

  it("executes the `onClose` callback when present", () => {
    let called = false;
    function closeCallback() {
      called = true;
    }

    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor, { onClose: closeCallback });

    lum.open();
    lum.close();
    expect(called).toBe(true);
  });

  it("injects styles into shadow root if parented by one", () => {
    // TODO (43081j): remove when firefox ships with shadow DOM
    if (typeof ShadowRoot === "undefined") {
      return;
    }
    const container = document.createElement("div");
    container.attachShadow({ mode: "open" });
    const anchor = document.createElement("a");
    anchor.href = "https://example.com/image.png";
    anchor.classList.add("test-shadow-anchor");

    container.shadowRoot.appendChild(anchor);
    document.body.appendChild(container);

    const lum = new Luminous(anchor);
    const styles = container.shadowRoot.querySelector("style.lum-base-styles");
    expect(styles).not.toBe(null);
  });

  it("appends to shadow dom if parented by one", () => {
    // TODO (43081j): remove when firefox ships with shadow DOM
    if (typeof ShadowRoot === "undefined") {
      return;
    }
    const container = document.createElement("div");
    container.attachShadow({ mode: "open" });
    const anchor = document.createElement("a");
    anchor.href = "https://example.com/image.png";
    anchor.classList.add("test-shadow-anchor");

    container.shadowRoot.appendChild(anchor);
    document.body.appendChild(container);

    const lum = new Luminous(anchor);
    anchor.click();

    const lightbox = container.shadowRoot.querySelector(".lum-lightbox");
    expect(lightbox).not.toBe(null);
  });
});

describe("Configuration", () => {
  it("sets up settings object when no options are passed", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor);

    expect(lum.settings).toBeDefined();
  });

  it("applies proper setting defaults when no options are passed", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor);

    expect(lum.settings.sourceAttribute).toBe("href");
  });

  it("accepts custom settings", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor, { namespace: "not-the-default" });

    expect(lum.settings.namespace).toBe("not-the-default");
  });

  it("leaves settings defaults in place when custom settings are passed", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor, { namespace: "it-does-not-matter" });

    expect(lum.settings.openTrigger).toBe("click");
  });

  it("passes settings to Lightbox", () => {
    let anchor = document.querySelector(".test-anchor");
    const settingsToMap = {
      namespace: "custom",
      sourceAttribute: "not-href",
      caption: "custom",
      includeImgixJSClass: true,
      showCloseButton: {
        value: false,
        lightboxKey: "closeButtonEnabled"
      }
    };
    const isObject = v => typeof v === "object" && v != null;
    const clientSettings = Object.keys(settingsToMap).reduce((p, key) => {
      const valuePrimitiveOrObject = settingsToMap[key];
      p[key] = isObject(valuePrimitiveOrObject)
        ? valuePrimitiveOrObject.value
        : valuePrimitiveOrObject;
      return p;
    }, {});

    let lum = new Luminous(anchor, clientSettings);

    Object.keys(settingsToMap).forEach(settingKey => {
      const valuePrimitiveOrObject = settingsToMap[settingKey];
      let expectedKey, expectedValue;
      if (isObject(valuePrimitiveOrObject)) {
        const valueConfig = valuePrimitiveOrObject;
        expectedKey = valueConfig.lightboxKey || settingKey;
        expectedValue =
          "lightboxValue" in valueConfig
            ? valueConfig.lightboxValue
            : valueConfig.value;
      } else {
        expectedKey = settingKey;
        expectedValue = valuePrimitiveOrObject;
      }
      expect(lum.lightbox.settings[expectedKey]).toBe(expectedValue);
    });
  });
});

describe("#destroy", () => {
  it("does not throw if the Lightbox instance has never been `#open`ed", () => {
    let anchor = document.querySelector(".test-anchor");
    let lum = new Luminous(anchor);

    expect(function() {
      lum.destroy();
    }).not.toThrow();
  });
});
