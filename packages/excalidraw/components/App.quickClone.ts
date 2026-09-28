import { pointFrom } from "@excalidraw/math";

import {
  bindBindingElement,
  duplicateElements,
  getSelectionStateForElements,
  isArrowElement,
  isBindableElement,
  isNonDeletedElement,
  makeNextSelectedElementIds,
  newArrowElement,
  newElementWith,
  CaptureUpdateAction,
} from "@excalidraw/element";

import type {
  ExcalidrawElement,
  NonDeleted,
  NonDeletedExcalidrawElement,
  ExcalidrawBindableElement,
  ExcalidrawArrowElement,
} from "@excalidraw/element/types";

import type App from "./App";

export type CloneDirection = "up" | "down" | "left" | "right";

/** gap between the original and the clone, in scene coordinates */
const CLONE_GAP = 40;

export class AppQuickClone {
  constructor(private app: App) {}

  cloneWithArrow = (direction: CloneDirection) => {
    const selectedElements = this.app.scene.getSelectedElements({
      selectedElementIds: this.app.state.selectedElementIds,
    });

    if (selectedElements.length !== 1) {
      return;
    }

    const element = selectedElements[0];
    if (!isBindableElement(element)) {
      return;
    }

    // Calculate the offset for the clone based on direction
    let offsetX = 0;
    let offsetY = 0;
    switch (direction) {
      case "up":
        offsetY = -(element.height + CLONE_GAP);
        break;
      case "down":
        offsetY = element.height + CLONE_GAP;
        break;
      case "left":
        offsetX = -(element.width + CLONE_GAP);
        break;
      case "right":
        offsetX = element.width + CLONE_GAP;
        break;
    }

    // Duplicate the element at the new position
    const duplication = duplicateElements({
      type: "everything",
      elements: [
        newElementWith(element, {
          x: element.x + offsetX,
          y: element.y + offsetY,
        }),
      ],
      randomizeSeed: true,
    });

    const clone = duplication.duplicatedElements[0];
    if (!clone || !isNonDeletedElement(clone)) {
      return;
    }

    // Calculate arrow start/end points based on direction
    let startX: number;
    let startY: number;
    let endX: number;
    let endY: number;
    switch (direction) {
      case "right":
        startX = element.x + element.width;
        startY = element.y + element.height / 2;
        endX = clone.x;
        endY = clone.y + clone.height / 2;
        break;
      case "left":
        startX = element.x;
        startY = element.y + element.height / 2;
        endX = clone.x + clone.width;
        endY = clone.y + clone.height / 2;
        break;
      case "down":
        startX = element.x + element.width / 2;
        startY = element.y + element.height;
        endX = clone.x + clone.width / 2;
        endY = clone.y;
        break;
      case "up":
        startX = element.x + element.width / 2;
        startY = element.y;
        endX = clone.x + clone.width / 2;
        endY = clone.y + clone.height;
        break;
    }

    // Create the arrow connecting original to clone
    const arrow = newArrowElement({
      type: "arrow",
      x: startX,
      y: startY,
      startArrowhead: null,
      endArrowhead: this.app.state.currentItemEndArrowhead,
      strokeColor: element.strokeColor,
      strokeStyle: element.strokeStyle,
      strokeWidth: element.strokeWidth,
      opacity: 100,
      roughness: element.roughness,
      points: [pointFrom(0, 0), pointFrom(endX - startX, endY - startY)],
    });

    // Add clone and arrow to the scene
    this.app.insertNewElements([clone, arrow]);

    // Bind the arrow to both the original and the clone
    const elementsMap = this.app.scene.getNonDeletedElementsMap();
    const arrowInScene = elementsMap.get(arrow.id);
    const cloneInScene = elementsMap.get(clone.id);
    const originalInScene = elementsMap.get(element.id);

    if (
      arrowInScene &&
      isArrowElement(arrowInScene) &&
      cloneInScene &&
      isBindableElement(cloneInScene) &&
      originalInScene &&
      isBindableElement(originalInScene)
    ) {
      bindBindingElement(
        arrowInScene as NonDeleted<ExcalidrawArrowElement>,
        originalInScene as NonDeleted<ExcalidrawBindableElement>,
        "orbit",
        "start",
        this.app.scene,
        this.app.state.zoom,
      );
      bindBindingElement(
        arrowInScene as NonDeleted<ExcalidrawArrowElement>,
        cloneInScene as NonDeleted<ExcalidrawBindableElement>,
        "orbit",
        "end",
        this.app.scene,
        this.app.state.zoom,
      );
    }

    // Select the clone
    this.app.setState((prevState) => ({
      selectedElementIds: makeNextSelectedElementIds(
        { [clone.id]: true },
        prevState,
      ),
    }));

    this.app.syncActionResult({
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };
}
