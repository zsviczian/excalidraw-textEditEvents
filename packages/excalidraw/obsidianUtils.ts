import { FreedrawIcon } from "./components/icons";
import { FONT_FAMILY } from "./constants";
import { Fonts, register } from "./fonts";
import { FONT_METADATA, FontMetadata, LOCAL_FONT_PROTOCOL } from "./fonts/metadata";

//zsviczian, my dirty little secrets. These are hacks I am not proud of...
export let hostPlugin: any = null;

export function destroyObsidianUtils() {
  hostPlugin = null;
}

export function initializeObsidianUtils (obsidianPlugin: any) {
  hostPlugin = obsidianPlugin;
}

export function getAreaLimit() {
  return hostPlugin.excalidrawConfig.areaLimit ?? 16777216;
}

export function getWidthHeightLimit() {
  return hostPlugin.excalidrawConfig.widthHeightLimit ?? 32767;
}

export function isExcaliBrainView() {
  const excalidrawView = hostPlugin.activeExcalidrawView;
  if(!excalidrawView) return false;
  return excalidrawView.linksAlwaysOpenInANewPane && excalidrawView.allowFrameButtonsInViewMode;
}

export function getExcalidrawContentEl():HTMLElement {
  const excalidrawView = hostPlugin.activeExcalidrawView;
  if(!excalidrawView) return document.body;
  return excalidrawView.contentEl as HTMLElement;
}

export function hideFreedrawPenmodeCursor() {
  return !hostPlugin.settings.penModeCrosshairVisible;
}

export function getOpenAIDefaultVisionModel() {
  return hostPlugin.settings.openAIDefaultVisionModel;
}

export function registerLocalFont(fontMetrics: FontMetadata & {name: string}, uri: string) {
  const _register = register.bind({registered: Fonts.registered});
  FONT_METADATA[FONT_FAMILY["Local Font"]] = {metrics: fontMetrics.metrics, icon: FreedrawIcon};
  _register("Local Font", fontMetrics, {uri});
}

export function getFontFamilies(): string[] {
  const fontFamilies: Set<string> = new Set();
  for (const fontFaces of Fonts.registered.values()) {
    if(fontFaces.metadata.local) continue;
    for (const font of fontFaces.fonts) {
      if(font.fontFace.family === "Local Font") continue;
      fontFamilies.add(font.fontFace.family);
    }
  }
  return Array.from(fontFamilies);
}

export async function registerFontsInCSS() {
  const styleId = 'ExcalidrawFonts';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  } else {
    styleElement.textContent = '';
  }

  let cssContent = '';

  for (const fontFaces of Fonts.registered.values()) {
    if (fontFaces.metadata.local) continue;
    for (const font of fontFaces.fonts) {
      try {
        const content = await font.getContent();
        cssContent += `@font-face {font-family: ${font.fontFace.family}; src: url(${content});}\n`;
      } catch (e) {
        console.error(
          `Skipped inlining font "${font.toString()}"`,
          e,
        );
      }
    }
  }
  styleElement.textContent = cssContent;
}

export async function getFontDefinition(fontFamily: number): Promise<string> {
  const fontFaces = Fonts.registered.get(fontFamily)?.fonts;
  if (!fontFaces) return "";
  const fontFace = fontFaces[0];
  if (!fontFace) return "";
  return await fontFace.getContent();
}