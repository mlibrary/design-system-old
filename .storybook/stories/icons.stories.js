import icons from "../../packages/icons/icons";

export default { title: "Icon" };

export function allIcons() {
  const iconElements = Object.keys(icons).map(iconName => {
    return `
      <li>
        <m-icon name="${iconName}"></m-icon> ${iconName}
      </li>
    `;
  });

  return `
    <ul>
      ${iconElements.join("\r\n")}
    </ul>
  `;
}
