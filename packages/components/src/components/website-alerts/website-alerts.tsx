import { Component, State, h } from "@stencil/core";

@Component({
  tag: "m-website-alerts",
  styleUrl: "website-alerts.scss",
  shadow: true
})
export class WebsiteAlerts {
  @State() status = "idle";
  @State() alerts;

  componentWillLoad() {
    this.status = "loading";
    fetch("https://staff.lib.umich.edu/api/alerts")
      .then(response => response.json())
      .then(result => {
        const hostname = window.location.hostname;
        const alertsThatTargetHost = result.reduce((memo, alert) => {
          const domains = alert.domains.split(", ");

          if (domains.includes(hostname)) {
            memo = memo.concat(alert);
          }

          return memo;
        }, []);

        if (alertsThatTargetHost.length > 0) {
          this.alerts = alertsThatTargetHost;
          this.status = "success";
        } else {
          this.status = "no-alerts";
        }
      })
      .catch(() => {
        this.status = "error";
        console.warn("Unable to fetch U-M Library Website Alerts.");
      });
  }

  render() {
    if (this.status === "success") {
      return (
        <div class="m-alerts" role="alert">
          <h2 class="m-alerts__heading">
            Important message{this.alerts.length > 1 ? "s" : ""}
          </h2>
          {this.alerts.map(alert => (
            <div class="m-alert">
              <div class="m-alert__content">
                <m-icon name="warning"></m-icon>
                <div class="m-alert__html" innerHTML={alert.html} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }
}
