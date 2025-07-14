/* 
const defaultConfig = `
{
    "stops": [
        {
            "code": 16991,
            "name": "Front Gate",
            "svcs": ["189"]
        },
        {
            "code": 17191,
            "name": "Back Gate",
            "svcs": ["196"]
        }
    ]
}`
*/
const defaultConfig = `{"stops":[{"code":16991,"name":"Front Gate","svcs":["189"]},{"code":17191,"name":"Back Gate","svcs":["196"]}]}`;

const dateToTime = (dateObj) => {
    const p = x=> x.toString().padStart(2, "0");
    return `${p((dateObj.getUTCHours()+8)%24)}:${p(dateObj.getMinutes())}:${p(dateObj.getSeconds())}`;
}

const getArrData = async (stopCode) => {
    if (typeof stopCode !== "number") return false;

    return await (fetch(`https://arrivelah2.busrouter.sg/?id=${stopCode}`, {"cache": "reload"})
    .then(x => x.json())
    .catch(() => false));
}

const newElem = x => document.createElement(x);

const initPage = (mainContainer, stops) => {
    for (let stop of stops) {
        if (mainContainer.querySelector(`[data-stop-id="${stop.code}"]`)) continue;
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

                for (let i=1; i<=3; i++) {
                    const timeBox = document.createElement("span");
                    timeBox.classList.add("time-indicator");
                    timeBox.textContent = "";
                    timeBox.dataset.busCount = ["next", "next2", "next3"][i - 1];
                    svcCont.append(timeBox);
                }

                svcHolder.append(svcCont);
            }
        }

        stopDiv.append(stopHeader, svcHolder);
        mainContainer.append(stopDiv);
    }
    const lastUpdateHolder = document.createElement("div");
    lastUpdateHolder.id = "last-update";
    lastUpdateHolder.textContent = "Loading data..."
    mainContainer.after(lastUpdateHolder);
}

const loadData = async (mainContainer, stops) => {
    if (!mainContainer.querySelector(".stop-container")) initPage();

    const setClass = (elem, cls) => {
        for (let clsName of ["seat", "stand", "no"]) elem.classList.toggle(clsName, clsName === cls);
    }

    const milToMins = (mils) => Math.floor(mils / 1000 / 60);

    for (let stop of stops) {
        (async function() {
            const stopBox = mainContainer.querySelector(`[data-stop-id="${stop.code}"]`);
            const svcHolder = stopBox.querySelector(":scope .service-holder");

            const data = await getArrData(stop.code);
            console.log(data);

            if (!data) {
                const p = document.createElement("p");
                p.textContent = "Stop data could not be loaded";
                svcHolder.before(p)
                return;
            }

            const dataSource = stop.svcs;
            

            for (let svc of dataSource) {
                console.log(svc);

                const svcCont = svcHolder.querySelector(`:scope [data-service="${svc}"]`);

                for (let key of ["next", "next2", "next3"]) {
                    const indicator = svcCont.querySelector(`:scope [data-bus-count=${key}]`);
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

    mainContainer.parentNode.querySelector("#last-update").textContent = "Last updated " + dateToTime(new Date()) + " SGT";
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

    connectedCallback() {
        if (!this.#shadow) this.#shadow = this.attachShadow({mode: "open"});
        this.#template = this.querySelector("template");
        console.log(this.#template)

        if (this.#template) {
            this.#observer = new MutationObserver(() => this.connectedCallback());
            this.#observer.observe(this.#template.content, {subtree: true, childList: true});
        }  

        this.#config = this.#template?.content?.querySelector(`script[type="application/json"]`)?.textContent?.trim();
        console.log(this.#config);

        try {
            this.#config = JSON.parse(this.#config);
        } catch {
            this.#config = null;
        }

        if (!this.#config || !this.#template || !this.#template.content) {
            this.#shadow.innerHTML = `
            <div style="padding-top:2em;padding-bottom:2em;text-align:center;">
            <h2 style="font-size:1.5em;margin-top:0;">SGBusWidget</h2>
            <a style="color:#888888;" target="_blank" href="https://github.com/gohjy/sgbus-widget">View on GitHub</a>
            </div>
            `;
            return;
        }

        this.#shadow.innerHTML = `<link href="https://cdn.jsdelivr.net/gh/gohjy/sgbus-widget@0.1.4/style.min.css" rel="stylesheet">`;

        let styleHTML = "";
        
        for (let styleElem of this.#template.content.querySelectorAll(":is(style, link[href][rel=\"stylesheet\"])")) {
            console.log(this.#shadow.append)
            styleHTML += styleElem.outerHTML;
        }
        this.#shadow.innerHTML += styleHTML;

        this.#svcHolder = document.createElement("div");
        this.#svcHolder.classList.add("svc-all-holder")
        this.#shadow.append(this.#svcHolder);

        initPage(this.#svcHolder, this.#config.stops);
        loadData(this.#svcHolder, this.#config.stops);
        setInterval(() => loadData(this.#svcHolder, this.#config.stops), 30000);
    }
}

customElements.define("sgbus-widget", SGBusWidget);