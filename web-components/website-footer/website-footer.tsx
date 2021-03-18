import { Component, Prop, h } from "@stencil/core";

/**
 * @name Website Footer
 * @description TODO
 * @status experimental
 * @whenToUse TODO
 * @whenNotToUse TODO
 * @example
 * <m-website-footer></m-website-footer>
 * <script>
 *   var footer = document.querySelector()
 * </script>
 * @usedBy
 * - TODO
 */
@Component({
  tag: "m-website-footer",
  styleUrl: "website-footer.css",
  shadow: true
})
export class WebsiteFooter {
  @Prop({ reflect: true }) navigation: any;

  getYear() {
    let today = new Date();
    return today.getFullYear();
  }

  render() {
    console.log('this.navigation', this.navigation)

    return (
      <footer class="website-footer">
        <div class="viewport-container">
          <div class="website-footer__content">
            <section>
              <h2>University of Michigan Library</h2>
              <p>913 S. University Avenue<br/>Ann Arbor, MI 48109</p>
            </section>

            {this.navigation && this.navigation.map(section => {
              return (
                <section>
                  <h2>{section.title}</h2>
                  <ul>
                    {section.items.map(item => (
                      <li>
                        <a href={item.href}>{item.text}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
        <div class="website-footer__disclaimer">
          <div class="viewport-container">
            <p>© {this.getYear()}, Regents of the University of Michigan</p>
          </div>
        </div>
      </footer>
    );
  }
}
