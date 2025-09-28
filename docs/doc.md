# SGBusWidget
Custom element to display arrival timings of Singapore buses inside your page. Uses the [arrivelah API proxy](https://github.com/cheeaun/arrivelah) to fetch bus data from [LTA's datamall](https://datamall.lta.gov.sg/).

See the [demo page](./demo.html) for an idea of the final display.

> [!NOTE]
> 
> SGBusWidget is **not stable** and things **may break**! For this reason, you are recommended to load the script via a pinned version (@0.2.0), and please use the element with caution.

## Installation
Throw the following into your HTML:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gohjy/sgbus-widget@0.2.0/sgbus-widget.min.js"></script>
```

If you'd like to see debug logging (requests, data received, etc) add the `?debug` query parameter, like so:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/gohjy/sgbus-widget@0.2.0/sgbus-widget.min.js?debug"></script>
```

## Usage
```html
<!-- 
Attributes:

arrivelah-instance defines the instance of the arrivelah proxy that will be used to fetch data.
request-timeout is the time in seconds to wait before updating with new data.

Below, they are set to their defaults.
-->
<sgbus-widget
  arrivelah-instance="https://arrivelah2.busrouter.sg/"
  request-timeout="30">
  <template>
    <!-- You can include custom styling, which will be applied after the defaults -->
    <style>
      .svc-all-holder {
        /* 
         * Force the display to be single-column, regardless of screen size
         * See demo page for effect 
         */
        display: inline-block;
      }
    </style>

    <!-- 
      Your configuration goes in the script tag below
      Note that comments are not allowed in JSON, they are only 
      included here for ease of explanation 
    -->
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

The custom element will automatically refresh the data every 30 seconds. Change the `request-timeout` attribute of `<sgbus-widget>` to change this.

> [!NOTE]
> 
> If you do **not** include the `<template>` and `<script type="application/json">`, 
> SGBusWidget will just display a generic "SGBusWidget" screen
> (see the end of the [demo page](./demo.html) for an idea of how this works).

## Feedback

Questions can go on [GitHub Issues](https://github.com/gohjy/sgbus-widget/issues). 
The source code is available in the [GitHub repo](https://github.com/gohjy/sgbus-widget) as well.
