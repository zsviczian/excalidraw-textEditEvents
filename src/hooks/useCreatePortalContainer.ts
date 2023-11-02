import { useState, useRef, useLayoutEffect } from "react";
import { useDevice, useExcalidrawContainer } from "../components/App";
import { useUIAppState } from "../context/ui-appState";

export const useCreatePortalContainer = (opts?: {
  className?: string;
  parentSelector?: string;
  style?: {[x: string]: string;}; //zsviczian - Obsidian Dynamic Style
}) => {
  const [div, setDiv] = useState<HTMLDivElement | null>(null);

  const device = useDevice();
  const { theme } = useUIAppState();
  const isMobileRef = useRef(device.isMobile);
  isMobileRef.current = device.isMobile;

  const { container: excalidrawContainer } = useExcalidrawContainer();

  useLayoutEffect(() => {
    if (div) {
      div.classList.toggle("excalidraw--mobile", device.isMobile);
    }
  }, [div, device.isMobile]);

  useLayoutEffect(() => {
    const container = opts?.parentSelector
      ? excalidrawContainer?.querySelector(opts.parentSelector)
      : document.body;

    if (!container) {
      return;
    }

    const div = document.createElement("div");

    div.classList.add("excalidraw", ...(opts?.className?.split(/\s+/) || []));
    if(opts?.style) {
      const style = opts.style;
      const styleString = Object.keys(style)
        .map((property) => `${property}: ${style[property]}`)
        .join("; ");
      div.setAttribute("style", styleString); //zsviczian
    }
    div.classList.toggle("excalidraw--mobile", isMobileRef.current);
    div.classList.toggle("theme--dark", theme === "dark");

    container.appendChild(div);

    setDiv(div);

    return () => {
      container.removeChild(div);
    };
  }, [
    excalidrawContainer,
    theme,
    opts?.className,
    opts?.parentSelector,
    opts?.style,
  ]); //zsviczian added opts?.style

  return div;
};
