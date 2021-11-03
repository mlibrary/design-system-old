import { Component, Prop, h, State } from "@stencil/core";

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
  @State() dismissed: boolean = false

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

  dismiss(e) {
    e.preventDefault()

    this.dismissed = true;
  }

  render() {
    const stateClassName = this.variant === 'info' ?
      '' : `m-callout--${this.variant}`

    const iconName = this.getIconName()

    if (this.dismissed) {
      return null
    }

    return (
      <div class={`m-callout ${stateClassName} ${this.icon && 'm-callout--with-icon'}`} role="presentation">
        {this.icon && (<m-icon name={iconName} size="24"></m-icon>)}
        <div role="presentation" class="m-callout__inner-container"><slot /></div>
        {this.dismissable &&
          <button
            onClick={(e) => this.dismiss(e)}
            class="m-callout__dismiss"
          >
            Dismiss
          </button>
        }
      </div>
    )
  }
}
