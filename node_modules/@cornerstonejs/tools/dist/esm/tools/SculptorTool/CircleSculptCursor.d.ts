import type { Types } from '@cornerstonejs/core';
import type { ISculptToolShape } from '../../types/ISculptToolShape';
import type { SculptData } from '../SculptorTool';
import type { SVGDrawingHelper, EventTypes, ContourAnnotationData } from '../../types';
export type PushedHandles = {
    first?: number;
    last?: number;
};
declare class CircleSculptCursor implements ISculptToolShape {
    static shapeName: string;
    static readonly CHAIN_MAINTENANCE_ITERATIONS = 3;
    static readonly CHAIN_PULL_STRENGTH_FACTOR = 0.3;
    static readonly MAX_INTER_DISTANCE_FACTOR = 1.2;
    private toolInfo;
    renderShape(svgDrawingHelper: SVGDrawingHelper, canvasLocation: Types.Point2, options: unknown): void;
    pushHandles(viewport: Types.IViewport, sculptData: SculptData): PushedHandles;
    configureToolSize(evt: EventTypes.InteractionEventType): void;
    updateToolSize(canvasCoords: Types.Point2, viewport: Types.IViewport, activeAnnotation: ContourAnnotationData): void;
    getMaxSpacing(minSpacing: number): number;
    getInsertPosition(previousIndex: number, nextIndex: number, sculptData: SculptData): Types.Point3;
    private pushOneHandle;
    private directionalVector;
    private calculateMeanConsecutiveDistance;
    private maintainChainStructure;
}
export default CircleSculptCursor;
