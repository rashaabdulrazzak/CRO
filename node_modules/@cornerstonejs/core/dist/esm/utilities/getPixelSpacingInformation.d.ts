import { CalibrationTypes } from '../enums';
export default function getPixelSpacingInformation(instance: any): {
    PixelSpacing: any;
    type: CalibrationTypes;
    isProjection: boolean;
    PixelSpacingCalibrationType?: undefined;
    PixelSpacingCalibrationDescription?: undefined;
} | {
    PixelSpacing: any;
    type: CalibrationTypes;
    isProjection: boolean;
    PixelSpacingCalibrationType: any;
    PixelSpacingCalibrationDescription: any;
} | {
    PixelSpacing: number[];
};
