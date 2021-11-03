import { Component, Prop, h } from "@stencil/core";

/**
 * Related Design System Figma file:
 * 
 * https://www.figma.com/file/dxzvdBeoQTcBpSyMoLVQfY/Design-System-Design-Library?node-id=536%3A144
 */

/**
 * @name Callout
 * @description For communicating important messages in a user's workflow.
 */
@Component({
  tag: "m-callout",
  styleUrl: "callout.scss",
})
export class Callout {
  @Prop() state: string = 'default'

  render() {
    const stateClassName = this.state === 'default' ?
      '' : `m-callout--${this.state}`

    return (
      <div class={`m-callout ${stateClassName}`} role="presentation">
        <m-icon name="info"></m-icon> <slot />
      </div>
    )
  }
}
