import { Component, Prop, Host, h } from "@stencil/core";
import icons from "@umich-lib/icons";
import { sendMessage } from "@umich-lib/utils";

@Component({
  tag: "m-icon",
  styleUrl: "icon.scss"
})
export class Icon {
  @Prop() name: string;

  render() {
    const icon = icons[this.name];

    if (!icon) {
      sendMessage("Unable to find Icon with name: " + this.name);
      return null;
    }

    return <Host innerHTML={icon.svg}></Host>;
  }
}
