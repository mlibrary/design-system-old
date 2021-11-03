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
  @Prop({
    reflect: true
  }) variant: string = 'info'
  @Prop({
    reflect: true
  }) dismissable: boolean = false;
  @Prop({
    reflect: true
  }) icon: boolean = true;

  getIconName() {
    switch (this.variant) {
      case 'success':
        return 'check'
      case 'error':
        return 'warning'
      case 'warning':
        return 'info'
      default:
        return this.variant
    }
  }

  render() {
    const stateClassName = this.variant === 'info' ?
      '' : `m-callout--${this.variant}`

    const iconName = this.getIconName()

    return (
      <div class={`m-callout ${stateClassName} ${this.icon && 'm-callout--with-icon'}`} role="presentation">
        {this.icon && (<m-icon name={iconName} size="24"></m-icon>)}
        <slot />
      </div>
    )
  }
}
