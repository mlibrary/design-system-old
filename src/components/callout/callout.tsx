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
   * Select the overall callout intent, colors, and corresponding hidden label that is the alternative text for the visual style.
   * */
  @Prop() variant: 'info' | 'success' | 'error' | 'warning' = 'info';

  /**
   * Makes the element dismissable by the user with a button control.
   */
  @Prop() dismissable: boolean = false;

  /**
   * Set to `false` to remove the icon.
   */
  @Prop() icon: boolean = true;

  /**
   * Makes the element visually less strong by removing the background color.
   */
  @Prop() subtle: boolean = false;
  
  @State() dismissed: boolean = false

  getVariant() {
    switch (this.variant) {
      case 'success':
        return {
          iconName: 'check',
          label: 'Success: '
        }
      case 'error':
        return {
          iconName: 'error',
          label: 'Error: '
        }
      case 'warning':
        return {
          iconName: 'warning',
          label: 'Warning: '
        }
      default:
        return {
          iconName: 'info',
          label: 'Important information: '
        }
    }
  }

  dismiss(e) {
    e.preventDefault()

    this.dismissed = true;
  }

  render() {
    const stateClassName = this.variant === 'info' ?
      '' : `m-callout--${this.variant}`

    const variant = this.getVariant()

    if (this.dismissed) {
      return null
    }

    return (
      <div
        class={
          `m-callout ${stateClassName}
          ${this.icon && 'm-callout--with-icon'}
          ${this.subtle && 'm-callout--subtle'}
          `
        }
        role="presentation">
        {this.icon && (
          <m-icon name={variant.iconName} size="24"></m-icon>
        )}
        <div role="presentation" class="m-callout__inner-container">
          <strong class="visually-hidden m-callout__label">{variant.label}</strong><slot />
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
