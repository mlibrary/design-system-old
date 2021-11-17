import { Component, Prop, h, State } from "@stencil/core";

/**
 * @name Callout
 * @description For communicating important messages in a user's workflow.
 */
@Component({
  tag: "m-callout",
  styleUrl: "callout.scss",
})
export class Callout {
  /**
   * Sets the overall callout visual style, such as colors.
   * */
  @Prop() variant: 'info' | 'success' | 'warning' | 'critical' = 'info';

  /**
   * Makes this dismissable by the user with a button.
   */
  @Prop() dismissable: boolean = false;

  /**
   * Add attribute to show the default icon, or icon name to display one. Consider using `check`, `error`, `warning` or `info`.
   */
  @Prop() icon: string | false

  /**
   * Adds an attention grabbing label alternative to the visual style. It's highly recommended to include this.
   */
   @Prop() label: string

  /**
   * Makes the element visually less strong by removing the background color.
   */
  @Prop() subtle: boolean = false;
  
  @State() dismissed: boolean = false

  dismiss(e) {
    e.preventDefault()

    this.dismissed = true;
  }

  getIcon() {
    if (this.icon && this.icon.length > 0 && this.icon !== 'default') {
      return this.icon
    }

    if (
      typeof this.icon === 'string' &&
      (this.icon.length === 0 || this.icon === 'default')
    ) {
      switch (this.variant) {
        case 'success':
          return 'check'
        case 'critical':
          return 'error'
        case 'warning':
          return 'warning'
        default:
          return 'info'
      }
    }

    return false
  }

  render() {
    const stateClassName = this.variant === 'info' ?
      '' : `m-callout--${this.variant}`

    if (this.dismissed) {
      return null
    }

    const icon = this.getIcon()

    return (
      <div
        class={
          `m-callout ${stateClassName}
          ${icon && 'm-callout--with-icon'}
          ${this.subtle && 'm-callout--subtle'}
          `
        }
        role="presentation">
        {icon && (
          <m-icon name={icon} size="24"></m-icon>
        )}
        <div role="presentation" class="m-callout__inner-container">
          {this.label && (<strong class="m-callout__label">Important</strong>)}
          <slot />
        </div>
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
