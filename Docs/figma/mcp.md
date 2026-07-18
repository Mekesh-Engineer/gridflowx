# Guide: Figma MCP Server Setup & Tailwind CSS Prototyping

This guide outlines how to set up the **Figma Model Context Protocol (MCP) Server** to bridge your Figma designs directly with your AI assistant, and convert design layouts into functional **HTML + Tailwind CSS** prototypes.

---

## 1. Setting Up the Figma MCP Server

The Figma MCP Server allows your AI assistant to read design files, extract node properties (colors, layouts, spacing), and download image assets directly.

### Step 1: Obtain a Figma Personal Access Token

1. Go to your **Figma account settings**.
2. Scroll down to the **Personal access tokens** section.
3. Click **Create a new personal access token**.
4. Give it a name (e.g., `Antigravity IDE`), set permissions to read-only or read-write, and copy the generated token.

### Step 2: Configure the MCP Host

Add the figma server configuration to your MCP configuration file (e.g., `claude_desktop_config.json` or your IDE's MCP settings):

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_PERSONAL_ACCESS_TOKEN": "YOUR_FIGMA_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

Once saved, your AI assistant will have access to Figma tools such as:

- `get-file` (Retrieves the JSON document structure of a file)
- `get-file-nodes` (Retrieves style/layout details of specific frames)
- `get-images` (Generates and retrieves links to rendered image elements)

---

## 2. Converting Figma Designs to HTML + Tailwind CSS

When you ask the AI to translate a Figma component, it uses the JSON node tree returned by the MCP tools and maps Figma properties directly to Tailwind utility classes.

### Auto-Layout Mapping Cheat Sheet

| Figma Property     | JSON Value                           | Tailwind Equivalent        |
| ------------------ | ------------------------------------ | -------------------------- |
| **Layout Mode**    | `layoutMode: "HORIZONTAL"`           | `flex flex-row`            |
|                    | `layoutMode: "VERTICAL"`             | `flex flex-col`            |
| **Alignment**      | `primaryAxisAlignItems: "CENTER"`    | `justify-center`           |
|                    | `counterAxisAlignItems: "CENTER"`    | `items-center`             |
| **Spacing**        | `itemSpacing: 16`                    | `gap-4` (16px / 4)         |
| **Padding**        | `paddingTop: 24`                     | `pt-6` (24px / 4)          |
| **Corner Radius**  | `cornerRadius: 12`                   | `rounded-xl`               |
| **Fills / Colors** | `color: {r: 0.13, g: 0.77, b: 0.36}` | `bg-[#22c55e]` (hex value) |

---

## 3. Step-by-Step Translation Workflow

### Step 1: Tell the AI the Figma File URL

Send the URL of your Figma file or specific frame to your AI assistant:

> _"Import the Figma design from `https://www.figma.com/file/XYZ123/GridFlowX-Dashboard` into an HTML prototype."_

### Step 2: AI Fetches the Design Tree

The assistant calls `get-file` or `get-file-nodes` to retrieve the spacing, colors, typography, and nesting hierarchies of the UI elements.

### Step 3: Layout Generation

The AI generates a clean HTML file structured with Tailwind classes (using semantic layout structures, standard typography scales, flexbox grid alignments, and custom design tokens).

### Step 4: Asset Retrieval (Favicons / Images)

For complex vectors or raster images inside Figma, the AI calls the `get-images` tool to export them as SVGs or PNGs, placing them into your project's `/public` folder for rendering.
