# Layout Specification: Executive Streaming Chat Interface

## 1. Design Philosophy & Goals

This specification outlines the layout and typographic principles for the Streaming Chat Interface, designed specifically for Fortune 100 business executives. The core goals are:

*   **Uncompromising Clarity:** Ensure immediate comprehension and effortless readability of information.
*   **Understated Professionalism:** Project competence and trustworthiness through refined, distraction-free design.
*   **Efficiency:** Facilitate rapid interaction and information scanning.
*   **Harmonious Structure:** Employ classical proportion and rhythm to create a calm, ordered, and reliable user experience.
*   **Accessibility:** Adhere to high contrast standards and logical structure.

## 2. Layout Architecture

The interface employs a structured layout based on CSS Grid for precise control over proportions and alignment, ensuring consistency across different screen sizes.

*   **Main Container (`container`):**
    *   Centered horizontally and vertically within the viewport.
    *   Utilizes a maximum width (e.g., `960px`) for optimal line lengths on larger displays but remains fluid below that width.
    *   Defined vertical height (e.g., `85vh`) with internal scrolling for content overflow.
    *   Employs subtle `border-radius` (e.g., `8px`) and a minimal `box-shadow` for definition without visual clutter.
    *   Internal padding based on the base spacing unit (see Section 4).
*   **Header (`h1` area):**
    *   Occupies a defined top portion of the grid container.
    *   Text centrally aligned.
    *   Separated from the chatbox by clean whitespace or a very subtle hairline border (1px, light neutral gray).
*   **Chat Area (`#chatbox`):**
    *   Occupies the main central region of the grid container, configured to grow and enable vertical scrolling (`overflow-y: auto`).
    *   Padding governed by the base spacing unit.
    *   Messages align to a vertical grid defined by the base line-height.
*   **Input Area (`#chat-form`):**
    *   Fixed at the bottom of the grid container.
    *   Separated from the chatbox by whitespace or a subtle hairline border.
    *   Elements (input, button) vertically aligned and spaced according to the system.

## 3. Grid & Proportional System

*   **Base Unit:** Establish a base unit (e.g., `8px`) derived from the primary body text size and line height. All spacing (padding, margins) and potentially component sizes should be multiples of this unit to ensure mathematical harmony.
*   **Internal Grid (Optional but Recommended):** Consider a 12-column flexible grid within the main container to guide the placement of potential future UI elements or complex message types, though the current simple layout may not strictly require visual columns.

## 4. Spacing & Vertical Rhythm

*   **Base Line Height:** Define a core line height for body text (e.g., `1.6` relative to font size) to establish the vertical rhythm.
*   **Spacing Scale:** Use a modular scale (e.g., based on the golden ratio ≈ 1.618, or simpler ratios like 1.5) derived from the base unit for consistent padding and margins:
    *   Example: `8px`, `12px` (`8 * 1.5`), `16px` (`8 * 2`), `24px` (`16 * 1.5`), `32px` (`16 * 2`), etc.
    *   Apply this scale consistently for container padding, gaps between messages, form padding, etc.

## 5. Typography

*   **Font Family:** `Inter` (Variable font preferred for fine control).
    *   `UI Elements / Body Text:` Inter Regular (`wght 400`).
    *   `Emphasis / Buttons:` Inter Medium (`wght 500`).
    *   `Headings:` Inter Semi-Bold (`wght 600`).
*   **Typographic Scale:** Implement a harmonious scale (e.g., Major Third - 1.250) based on a comfortable body text size (e.g., `16px`).
    *   Example (`16px` base): `12.8px` (small text), `16px` (body), `20px` (sub-heading), `25px` (heading `h1`).
*   **Readability:**
    *   **Line Length:** Target 65-75 characters maximum within message bubbles (`max-width` adjusted accordingly).
    *   **Line Height:** Maintain consistent `line-height` (e.g., `1.6`) for body text. Adjust slightly for headings if needed.
    *   **Paragraph Spacing:** Use space equivalent to one line height (or a value from the spacing scale) between distinct messages.
*   **Color:** Ensure high contrast ratios (WCAG AA minimum, AAA preferred).
    *   `Text:` Very dark gray (e.g., `#1A1A1A`) instead of pure black.
    *   `Background:` Off-white or very light neutral gray (e.g., `#F9F9FA`).
    *   `User Message Background:` Sophisticated, slightly desaturated blue (e.g., `#005EA2`). Text: `White`.
    *   `AI Message Background:` Lighter neutral gray (e.g., `#EAEAEF`). Text: Dark Gray (`#1A1A1A`).
    *   `Borders/Accents:` Subtle, light neutral grays (e.g., `#DCDCE0`).

## 6. UI Elements

*   **Buttons (`#send-button`):**
    *   Padding derived from the spacing scale.
    *   Subtle `border-radius` (e.g., `6px`).
    *   Clear visual states (hover, focus, disabled) using slight changes in background shade or border, avoiding overly strong shadows. Focus state should use a visible outline matching the brand blue.
*   **Input Fields (`#message-input`):**
    *   Padding derived from the spacing scale. Matches button height.
    *   Subtle `border-radius` (e.g., `6px`).
    *   Minimal border in resting state, clear focus state matching the button focus.
*   **Message Bubbles (`.message`):**
    *   Padding derived from the spacing scale.
    *   Increased `border-radius` (e.g., `12px`) but potentially less than the current `20px` for a slightly more formal feel. Avoid flattening specific corners; maintain consistency.

## 7. Responsiveness

*   Employ fluid typography and spacing based on viewport width where appropriate, but maintain the core proportional relationships.
*   Use relative units (`%`, `em`, `rem`) extensively.
*   Ensure the layout reflows gracefully on smaller screens, potentially stacking elements if necessary, while preserving clear hierarchy and readability. The core single-column chat is inherently mobile-friendly.

## 8. Rationale Summary

This specification utilizes established principles of grid systems, typographic scales, and vertical rhythm to create an interface that is not merely functional but feels inherently stable, clear, and professional. The emphasis on proportion and consistency reduces cognitive load and supports efficient communication, aligning with the needs of executive users.
