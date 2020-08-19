import { Component, Prop, State, Host, h, Build } from "@stencil/core";
import { fetchIcon } from "./utils";
/**
 * @name Icon
 * @description For SVG icons.
 * @status experimental
 * @private
 */
@Component({
  tag: "m-icon",
  assetsDirs: ["svgs"]
})
export class Icon {
  @Prop() name: string;
  @State() icon: string = null;

  componentWillLoad() {
    if (Build.isBrowser) {
      this.loadIcon();
    }
  }

  async loadIcon() {
    const icon = await fetchIcon({ icon: this.name });

    if (icon) {
      this.icon = icon;
    }
  }

  render() {
    if (this.icon) {
      return <Host innerHTML={this.icon}></Host>;
    }

    return null;
  }
}
