import { isEqual } from './isEqual';
import { CalibrationTypes } from '../enums';
const projectionRadiographSOPClassUIDs = new Set([
    '1.2.840.10008.5.1.4.1.1.1',
    '1.2.840.10008.5.1.4.1.1.1.1',
    '1.2.840.10008.5.1.4.1.1.1.1.1',
    '1.2.840.10008.5.1.4.1.1.1.2',
    '1.2.840.10008.5.1.4.1.1.1.2.1',
    '1.2.840.10008.5.1.4.1.1.1.3',
    '1.2.840.10008.5.1.4.1.1.1.3.1',
    '1.2.840.10008.5.1.4.1.1.12.1',
    '1.2.840.10008.5.1.4.1.1.12.1.1',
    '1.2.840.10008.5.1.4.1.1.12.2',
    '1.2.840.10008.5.1.4.1.1.12.2.1',
    '1.2.840.10008.5.1.4.1.1.12.3',
]);
function calculateRadiographicPixelSpacing(instance) {
    const { PixelSpacing, ImagerPixelSpacing, EstimatedRadiographicMagnificationFactor, PixelSpacingCalibrationType, PixelSpacingCalibrationDescription, } = instance;
    const isProjection = true;
    if (!ImagerPixelSpacing) {
        return {
            PixelSpacing,
            type: CalibrationTypes.UNKNOWN,
            isProjection,
        };
    }
    if (!PixelSpacing) {
        if (!EstimatedRadiographicMagnificationFactor) {
            console.warn('EstimatedRadiographicMagnificationFactor was not present. Unable to correct ImagerPixelSpacing.');
            return {
                PixelSpacing: ImagerPixelSpacing,
                type: CalibrationTypes.PROJECTION,
                isProjection,
            };
        }
        const correctedPixelSpacing = ImagerPixelSpacing.map((pixelSpacing) => pixelSpacing / EstimatedRadiographicMagnificationFactor);
        return {
            PixelSpacing: correctedPixelSpacing,
            type: CalibrationTypes.ERMF,
            isProjection,
        };
    }
    if (isEqual(PixelSpacing, ImagerPixelSpacing)) {
        return {
            PixelSpacing,
            type: CalibrationTypes.PROJECTION,
            isProjection,
        };
    }
    if (PixelSpacingCalibrationType || PixelSpacingCalibrationDescription) {
        return {
            PixelSpacing,
            type: CalibrationTypes.CALIBRATED,
            isProjection,
            PixelSpacingCalibrationType,
            PixelSpacingCalibrationDescription,
        };
    }
    return {
        PixelSpacing,
        type: CalibrationTypes.UNKNOWN,
        isProjection,
    };
}
function calculateUSPixelSpacing(instance) {
    const { SequenceOfUltrasoundRegions } = instance;
    const isArrayOfSequences = Array.isArray(SequenceOfUltrasoundRegions);
    if (isArrayOfSequences && SequenceOfUltrasoundRegions.length > 1) {
        console.warn('Sequence of Ultrasound Regions > one entry. This is not yet implemented, all measurements will be shown in pixels.');
        return;
    }
    const { PhysicalDeltaX, PhysicalDeltaY } = isArrayOfSequences
        ? SequenceOfUltrasoundRegions[0]
        : SequenceOfUltrasoundRegions;
    const USPixelSpacing = [
        Math.abs(PhysicalDeltaX) * 10,
        Math.abs(PhysicalDeltaY) * 10,
    ];
    return {
        PixelSpacing: USPixelSpacing,
    };
}
export default function getPixelSpacingInformation(instance) {
    const { PixelSpacing, SOPClassUID, SequenceOfUltrasoundRegions } = instance;
    if (SequenceOfUltrasoundRegions) {
        return calculateUSPixelSpacing(instance);
    }
    const isProjection = projectionRadiographSOPClassUIDs.has(SOPClassUID);
    if (isProjection) {
        return calculateRadiographicPixelSpacing(instance);
    }
    return {
        PixelSpacing,
        type: CalibrationTypes.NOT_APPLICABLE,
        isProjection: false,
    };
}
