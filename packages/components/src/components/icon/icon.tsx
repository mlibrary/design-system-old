import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "m-icon",
  styleUrl: "icon.scss"
})
export class Icon {
  render() {
    return <Host>An icon!</Host>;
  }
}
