# Aruba aranet iot exporter

Using the aruba iot transport to push metrics from aranets to prometheus.
We only store the metrics when the age is 1, to only log it at the APs that detected it when
it was mesured. We are using the prom-client summary to keep a rolling count over the last 30 min.
For the radio to AP name mapping we use a json file, with ble radio mac to name of bucket to store it in.
