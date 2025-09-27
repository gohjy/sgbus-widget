const dateToTime = (dateObj) => {
  const p = x=> x.toString().padStart(2, "0");
  return `${
    p((dateObj.getUTCHours() + 8) % 24)
  }:${
    p(dateObj.getUTCMinutes())
  }:${
    p(dateObj.getUTCSeconds())
  }`;
}

const getArrData = async (stopCode, arrivelahInstance) => {
  if (typeof stopCode !== "number") return false;

  let urlObj = new URL(arrivelahInstance);
  urlObj.searchParams.set("id", stopCode);

  return await (fetch(urlObj.href, {"cache": "reload"})
  .then(x => x.json())
  .catch(() => false));
}

const hasSvcs = (stops) => {
  if (stops.length === 0) return false;
  if ([...stops].map(x => x.svcs).flat().length === 0) return false;
  return true;
};

const newElem = x => document.createElement(x);

const initPage = (mainContainer, stops) => {
  for (let stop of stops) {
    if (mainContainer.querySelector(`[data-stop-id="${stop.code}"]`)) continue;
    if (stop.svcs.length === 0) continue;

    const stopDiv = document.createElement("div");
    stopDiv.dataset.stopId = stop.code;
    stopDiv.classList.add("stop-container");

    const stopHeader = document.createElement("div");

    stopHeader.textContent = stop.name;

    const svcHolder = newElem("div");
    svcHolder.classList.add("service-holder");

    for (let svc of stop.svcs) {
      if (!svcHolder.querySelector(`:scope [data-service="${svc}"]`)) {
        const svcCont = document.createElement("div");
        svcCont.classList.add("service-container");
        svcCont.dataset.service = svc;

        const svcId = document.createElement("span");
        svcId.classList.add("service-id");
        svcId.textContent = svc;

        svcCont.append(svcId);

        for (let i=0; i<3; i++) {
          const timeBox = document.createElement("span");
          timeBox.classList.add("time-indicator");
          timeBox.textContent = "";
          timeBox.dataset.busCount = ["next", "next2", "next3"][i];

          if (i === 0) {
            timeBox.textContent = "Loading...";
            timeBox.classList.add("no-data", "grey"); // show dotted underline
          }

          svcCont.append(timeBox);
        }

        svcHolder.append(svcCont);
      }
    }

    const errorHolder = newElem("p");
    errorHolder.classList.add("error-holder");

    stopDiv.append(stopHeader, svcHolder, errorHolder);
    mainContainer.append(stopDiv);
  }
  const lastUpdateHolder = document.createElement("div");
  lastUpdateHolder.id = "last-update";
  lastUpdateHolder.textContent = "Loading data..."
  mainContainer.after(lastUpdateHolder);
}

const loadData = async (mainContainer, stops, options) => {
  if (
    !mainContainer.querySelector(".stop-container") 
    && hasSvcs(stops)
  ) initPage(mainContainer, stops);

  const setClass = (elem, cls) => {
    for (let clsName of ["seat", "stand", "no"]) elem.classList.toggle(clsName, clsName === cls);
  }

  const milToMins = (mils) => Math.floor(mils / 1000 / 60);

  for (let stop of stops) {
    if (stop.svcs.length === 0) {
      console.debug(`[SGBusWidget] Skipping processing stop ${stop.code} as no services are included`);
      continue;
    }

    (async function() {
      const stopBox = mainContainer.querySelector(`[data-stop-id="${stop.code}"]`);
      const svcHolder = stopBox.querySelector(":scope .service-holder");

      const data = await getArrData(stop.code, options.arrivelahInstance);
      console.debug(`[SGBusWidget] Stop arrival data for stop ${stop.code}:`, data);

      if (!data) {
        const errorArea = stopBox.querySelector(":scope > .error-holder");
        errorArea.textContent = "Stop data could not be loaded";
        stopBox.classList.add("has-error");

        return;
      }

      stopBox.classList.remove("has-error");

      for (let svc of stop.svcs) {
        console.debug("[SGBusWidget] Processing service:", svc);

        const svcCont = svcHolder.querySelector(`:scope [data-service="${svc}"]`);

        for (let key of ["next", "next2", "next3"]) {
          const indicator = svcCont.querySelector(`:scope [data-bus-count=${key}]`);
          indicator.classList.remove("grey");
          
          const svcArrData = data.services.find(x => x.no === svc);
          if (!svcArrData?.[key]?.time) {
            setClass(indicator, "");
            indicator.classList.add("no-data");
            indicator.textContent = "N/A"
            continue;
          }

          indicator.classList.remove("no-data")

          const comingTime = new Date(svcArrData[key].time);
          const offset = milToMins(Math.max(comingTime - new Date(), 0));

          indicator.textContent = ((offset === 0) ? "Arr" : `${offset} min`);

          indicator.classList.toggle("unmonitored-schedule", !svcArrData[key].monitored);
          
          setClass(indicator, {"SEA":"seat","SDA":"stand","LSD":"no"}[svcArrData[key].load]);
        }
      }
    })();
  }

  const lastUpdateHolder = mainContainer.parentNode.querySelector("#last-update");

  if (hasSvcs(stops)) {
    lastUpdateHolder.textContent = "Last updated " + dateToTime(new Date()) + " SGT";
  } else {
    lastUpdateHolder.textContent = "No stop data to display.";
    mainContainer.classList.add("no-stops");
  }
  
}

class SGBusWidget extends HTMLElement {
  #shadow;
  #svcHolder;
  #template;
  #config;
  #observer;

  constructor() {
    super();
  }

  static observedAttributes = ["arrivelah-instance", "request-interval"];

  connectedCallback() {
    if (!this.#shadow) this.#shadow = this.attachShadow({mode: "open"});
    this.#template = this.querySelector("template");
    console.debug("[SGBusWidget] <template>:", this.#template);

    if (this.#template) {
      this.#observer = new MutationObserver(() => this.connectedCallback());
      this.#observer.observe(this.#template.content, {subtree: true, childList: true});
    }  

    this.#config = this.#template?.content?.querySelector(`script[type="application/json"]`)?.textContent?.trim();
    console.debug("[SGBusWidget] Config:", this.#config);

    try {
      this.#config = JSON.parse(this.#config);
    } catch {
      this.#config = null;
    }

    if (!this.#config || !this.#template || !this.#template.content) {
      this.#shadow.innerHTML = `
      <div style="
        padding-top: 2em; 
        padding-bottom: 2em;
        text-align: center;
        ">
      <h2 style="
        font-size: 1.5em;
        margin-block-start: 0;
        ">SGBusWidget</h2>
      <a style="color: #888888;" target="_blank" href="https://github.com/gohjy/sgbus-widget">View on GitHub</a>
      </div>
      `;
      return;
    }

    this.#shadow.innerHTML = `<link href="https://cdn.jsdelivr.net/gh/gohjy/sgbus-widget@0.1.8/style.min.css" rel="stylesheet">`;

    let styleHTML = "";
    
    for (let styleElem of this.#template.content.querySelectorAll(":is(style, link[href][rel=\"stylesheet\"])")) {
      styleHTML += styleElem.outerHTML;
    }
    this.#shadow.innerHTML += styleHTML;

    this.#svcHolder = document.createElement("div");
    this.#svcHolder.classList.add("svc-all-holder")
    this.#shadow.append(this.#svcHolder);

    const options = {};
    try {
      options.arrivelahInstance = new URL(this.getAttribute("arrivelah-instance"));
    } catch {
      // if attr isn't set, URL() will throw
      options.arrivelahInstance = "https://arrivelah2.busrouter.sg/";
    }
    options.requestTimeout = Number.parseFloat(this.getAttribute("request-timeout"));
    if (
      Number.isNaN(options.requestTimeout)
      || (options.requestTimeout < 0)
    ) {
      options.requestTimeout = 30;
    }
    

    initPage(this.#svcHolder, this.#config.stops);
    loadData(this.#svcHolder, this.#config.stops, options);
    setInterval(() => loadData(this.#svcHolder, this.#config.stops, options), options.requestTimeout * 1000);
  }
}

customElements.define("sgbus-widget", SGBusWidget);
