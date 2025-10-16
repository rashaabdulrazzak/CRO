import { vec3 } from 'gl-matrix';
import { getEnabledElement } from '@cornerstonejs/core';
import { distancePointToContour } from '../distancePointToContour';
import { drawCircle as drawCircleSvg } from '../../drawingSvg';
import { point } from '../../utilities/math';
class CircleSculptCursor {
    constructor() {
        this.toolInfo = {
            toolSize: null,
            maxToolSize: null,
        };
    }
    static { this.shapeName = 'Circle'; }
    static { this.CHAIN_MAINTENANCE_ITERATIONS = 3; }
    static { this.CHAIN_PULL_STRENGTH_FACTOR = 0.3; }
    static { this.MAX_INTER_DISTANCE_FACTOR = 1.2; }
    renderShape(svgDrawingHelper, canvasLocation, options) {
        const circleUID = '0';
        drawCircleSvg(svgDrawingHelper, 'SculptorTool', circleUID, canvasLocation, this.toolInfo.toolSize, options);
    }
    pushHandles(viewport, sculptData) {
        const { points, mouseCanvasPoint } = sculptData;
        const pushedHandles = { first: undefined, last: undefined };
        const worldRadius = point.distanceToPoint(viewport.canvasToWorld(mouseCanvasPoint), viewport.canvasToWorld([
            mouseCanvasPoint[0] + this.toolInfo.toolSize,
            mouseCanvasPoint[1],
        ]));
        for (let i = 0; i < points.length; i++) {
            const handleCanvasPoint = viewport.worldToCanvas(points[i]);
            const distanceToHandle = point.distanceToPoint(handleCanvasPoint, mouseCanvasPoint);
            if (distanceToHandle > this.toolInfo.toolSize) {
                continue;
            }
            this.pushOneHandle(i, worldRadius, sculptData);
            if (pushedHandles.first === undefined) {
                pushedHandles.first = i;
                pushedHandles.last = i;
            }
            else {
                pushedHandles.last = i;
            }
        }
        if (pushedHandles.first !== undefined && pushedHandles.last !== undefined) {
            for (let i = 0; i < CircleSculptCursor.CHAIN_MAINTENANCE_ITERATIONS; i++) {
                this.maintainChainStructure(sculptData, pushedHandles);
            }
        }
        return pushedHandles;
    }
    configureToolSize(evt) {
        const toolInfo = this.toolInfo;
        if (toolInfo.toolSize && toolInfo.maxToolSize) {
            return;
        }
        const eventData = evt.detail;
        const element = eventData.element;
        const minDim = Math.min(element.clientWidth, element.clientHeight);
        const maxRadius = minDim / 12;
        toolInfo.toolSize = maxRadius;
        toolInfo.maxToolSize = maxRadius;
    }
    updateToolSize(canvasCoords, viewport, activeAnnotation) {
        const toolInfo = this.toolInfo;
        const radius = distancePointToContour(viewport, activeAnnotation, canvasCoords);
        if (radius > 0) {
            toolInfo.toolSize = Math.min(toolInfo.maxToolSize, radius);
        }
    }
    getMaxSpacing(minSpacing) {
        return Math.max(this.toolInfo.toolSize / 4, minSpacing);
    }
    getInsertPosition(previousIndex, nextIndex, sculptData) {
        let insertPosition;
        const { points, element, mouseCanvasPoint } = sculptData;
        const toolSize = this.toolInfo.toolSize;
        const enabledElement = getEnabledElement(element);
        const { viewport } = enabledElement;
        const previousCanvasPoint = viewport.worldToCanvas(points[previousIndex]);
        const nextCanvasPoint = viewport.worldToCanvas(points[nextIndex]);
        const midPoint = [
            (previousCanvasPoint[0] + nextCanvasPoint[0]) / 2.0,
            (previousCanvasPoint[1] + nextCanvasPoint[1]) / 2.0,
        ];
        const distanceToMidPoint = point.distanceToPoint(mouseCanvasPoint, midPoint);
        if (distanceToMidPoint < toolSize) {
            const directionUnitVector = {
                x: (midPoint[0] - mouseCanvasPoint[0]) / distanceToMidPoint,
                y: (midPoint[1] - mouseCanvasPoint[1]) / distanceToMidPoint,
            };
            insertPosition = [
                mouseCanvasPoint[0] + toolSize * directionUnitVector.x,
                mouseCanvasPoint[1] + toolSize * directionUnitVector.y,
            ];
        }
        else {
            insertPosition = midPoint;
        }
        const worldPosition = viewport.canvasToWorld(insertPosition);
        return worldPosition;
    }
    pushOneHandle(i, worldRadius, sculptData) {
        const { points, mousePoint } = sculptData;
        const handle = points[i];
        const directionUnitVector = this.directionalVector(mousePoint, handle);
        const position = vec3.scaleAndAdd(vec3.create(), mousePoint, directionUnitVector, worldRadius);
        handle[0] = position[0];
        handle[1] = position[1];
        handle[2] = position[2];
    }
    directionalVector(p1, p2) {
        return vec3.normalize(vec3.create(), [
            p2[0] - p1[0],
            p2[1] - p1[1],
            p2[2] - p1[2],
        ]);
    }
    calculateMeanConsecutiveDistance(points) {
        if (points.length < 2) {
            return 0;
        }
        let totalDistance = 0;
        const numPoints = points.length;
        for (let i = 0; i < numPoints; i++) {
            const nextIndex = (i + 1) % numPoints;
            const distance = point.distanceToPoint(points[i], points[nextIndex]);
            totalDistance += distance;
        }
        return totalDistance / numPoints;
    }
    maintainChainStructure(sculptData, pushedHandles) {
        const { points } = sculptData;
        const first = pushedHandles.first;
        const last = pushedHandles.last;
        const mean = Math.round((first + last) / 2);
        const numPoints = points.length;
        if (!sculptData.meanDistance) {
            sculptData.meanDistance = this.calculateMeanConsecutiveDistance(points);
        }
        const maxInterDistance = sculptData.meanDistance * CircleSculptCursor.MAX_INTER_DISTANCE_FACTOR;
        for (let i = mean; i >= 0; i--) {
            if (i >= numPoints - 1 || i < 0) {
                continue;
            }
            const nextIndex = i + 1;
            const distanceToNext = point.distanceToPoint(points[i], points[nextIndex]);
            if (distanceToNext > maxInterDistance) {
                const pullDirection = this.directionalVector(points[i], points[nextIndex]);
                const pullStrength = (distanceToNext - sculptData.meanDistance) / sculptData.meanDistance;
                const adjustmentMagnitude = pullStrength *
                    sculptData.meanDistance *
                    CircleSculptCursor.CHAIN_PULL_STRENGTH_FACTOR;
                points[i][0] += pullDirection[0] * adjustmentMagnitude;
                points[i][1] += pullDirection[1] * adjustmentMagnitude;
                points[i][2] += pullDirection[2] * adjustmentMagnitude;
            }
        }
        for (let i = mean + 1; i < numPoints; i++) {
            if (i >= numPoints || i <= 0) {
                continue;
            }
            const previousIndex = i - 1;
            const distanceToPrevious = point.distanceToPoint(points[i], points[previousIndex]);
            if (distanceToPrevious > maxInterDistance) {
                const pullDirection = this.directionalVector(points[i], points[previousIndex]);
                const pullStrength = (distanceToPrevious - sculptData.meanDistance) /
                    sculptData.meanDistance;
                const adjustmentMagnitude = pullStrength *
                    sculptData.meanDistance *
                    CircleSculptCursor.CHAIN_PULL_STRENGTH_FACTOR;
                points[i][0] += pullDirection[0] * adjustmentMagnitude;
                points[i][1] += pullDirection[1] * adjustmentMagnitude;
                points[i][2] += pullDirection[2] * adjustmentMagnitude;
            }
        }
    }
}
export default CircleSculptCursor;
