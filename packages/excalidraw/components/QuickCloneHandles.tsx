import React from "react";

import { sceneCoordsToViewportCoords } from "@excalidraw/common";

import {
  getElementAbsoluteCoords,
  isBindableElement,
} from "@excalidraw/element";

import type {
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";

import { useExcalidrawAppState } from "./App";
import { PlusIcon } from "./icons";
import type { CloneDirection } from "./App.quickClone";

import "./QuickCloneHandles.scss";

const HANDLE_OFFSET = 28; // viewport pixels from the element edge

type Props = {
  element: NonDeletedExcalidrawElement;
  elementsMap: ElementsMap;
  onClone: (direction: CloneDirection) => void;
};

export const QuickCloneHandles = ({
  element,
  elementsMap,
  onClone,
}: Props) => {
  const appState = useExcalidrawAppState();

  if (
    appState.contextMenu ||
    appState.newElement ||
    appState.resizingElement ||
    appState.isRotating ||
    appState.openMenu ||
    appState.viewModeEnabled ||
    !isBindableElement(element)
  ) {
    return null;
  }

  const [x1, y1, x2, y2] = getElementAbsoluteCoords(element, elementsMap);

  const { x: viewportX1, y: viewportY1 } = sceneCoordsToViewportCoords(
    { sceneX: x1, sceneY: y1 },
    appState,
  );
  const { x: viewportX2, y: viewportY2 } = sceneCoordsToViewportCoords(
    { sceneX: x2, sceneY: y2 },
    appState,
  );

  const left = viewportX1 - appState.offsetLeft;
  const top = viewportY1 - appState.offsetTop;
  const right = viewportX2 - appState.offsetLeft;
  const bottom = viewportY2 - appState.offsetTop;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  const handles: {
    direction: CloneDirection;
    x: number;
    y: number;
  }[] = [
    { direction: "up", x: centerX, y: top - HANDLE_OFFSET },
    { direction: "down", x: centerX, y: bottom + HANDLE_OFFSET },
    { direction: "left", x: left - HANDLE_OFFSET, y: centerY },
    { direction: "right", x: right + HANDLE_OFFSET, y: centerY },
  ];

  return (
    <div className="excalidraw-quick-clone-handles">
      {handles.map(({ direction, x, y }) => (
        <button
          key={direction}
          type="button"
          className="excalidraw-quick-clone-handle"
          title={`Clone ${direction}`}
          style={{
            transform: `translate(${x}px, ${y}px)`,
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClone(direction);
          }}
        >
          {PlusIcon}
        </button>
      ))}
    </div>
  );
};
