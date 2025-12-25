# Aruba aranet iot exporter

Using the aruba iot transport to push metrics from aranets to prometheus.
We only store the metrics when the age is 1, to only log it at the APs that detected it when
it was mesured. We are using the prom-client summary to keep a rolling count over the last 30 min.
For the radio to AP name mapping we use a json file, with ble radio mac to name of bucket to store it in.

# AOS8 config

```
iot radio-profile "ble-aranet" 
    radio-mode none ble 
    ble-opmode scanning 

iot transportProfile "ble-aranet" 
    serverType Telemetry-Websocket 
    serverURL "ws://<ip>:3001/aruba/aos8" 
    accessToken "<token>" 
    clientId "<identifier>" 
    reportingInterval 10 
    include-ap-group "<ap-group>" 
    bleDataForwarding 
    companyIdentifierFilter "0702" 

```
