# SGBusWidget
Custom element to display arrival timings of Singapore buses inside your page. Uses the [arrivelah API proxy](https://github.com/cheeaun/arrivelah) to fetch bus data from [LTA's datamall](https://datamall.lta.gov.sg/).

See the [demo page](./demo.html) for an idea of the final display.

> [!NOTE]
> 
> SGBusWidget is **not stable**! It is in **initial development** (v0.1.2), and things **may break**! For this reason, you are recommended to load the script via a pinned version (@0.1.2), and please use the element with caution.

## Installation
Throw the following into your HTML:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gohjy/sgbus-widget@0.1.2/sgbus-widget.min.js"></script>
```

## Usage
```html
<sgbus-widget>
    <template>
        <!-- You can include custom styling, which will be applied after the defaults -->
        <style>
            .svc-all-holder {
                /* Make the display single-column */
                /* See demo page for effect */
                display: inline-block;
            }
        </style>

        <!-- Your configuration goes in the script tag below -->
        <script type="application/json">
            // If you don't know your stop/service details, check out busrouter.sg
            {
                "stops": [
                    {
                        // Bus stop code
                        "code": 95109, 

                        // Name to be displayed
                        // Doesn't need to match actual stop name
                        "name": "Terminal 3", 

                        // Services as an array of strings 
                        // (this helps if your service has a letter, e.g. 97e)
                        "svcs": ["36", "858"] 
                    },
                    {
                        // You can include multiple stops...
                        "code": 95209, 
                        "name": "Terminal 4",
                        // with different sets of services
                        "svcs": ["36"]
                    }
                ]
            }
        </script>
    </template>
</sgbus-widget>
```

The custom element will automatically refresh the data every 30 seconds.

> [!NOTE]
> 
> If you do **not** include the `<template>` and `<script type="application/json">`, 
> SGBusWidget will just display a generic "SGBusWidget" screen
> (see the [demo page](./demo.html) for an idea of how this works).

## Feedback

Questions can go on [GitHub Issues](https://github.com/gohjy/sgbus-widget/issues). 
The source code is available in the [GitHub repo](https://github.com/gohjy/sgbus-widget) as well.