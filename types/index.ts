export interface SessionData {
    userId: number | null;
    email: string;
    isLoggedIn: boolean;
    isPhoneVerified: boolean;
    isPersonaVerified: boolean;
    authToken?: string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
    email: '',
    userId: null,
    isPhoneVerified: false,
    isPersonaVerified: false,
    authToken: ''
};

export interface Vehicle {
    vehicleId: string;
    make: string;
    model: string;
    year: number;
    image: string;
    price: number;
    tripCount: number;
}

export interface IDScanErrorResponse {
    code: string;
    message: string;
    additionalData?: { Id: string };
    propertyErrors?: any;
    multipleErrors?: IDScanErrorResponse[];
    traceId?: string;
}

export interface PrasedData {
    images: {
        selfie: string;
        front: string;
        back: string;
    };
    scores: {
        documentConfidence: number;
        antiSpoofing: number;
        faceMatch: number;
        addressConfidence: number;
        dmvValidation: string;
        dmvReason: string;
        addressValidation: string;
        addressReason: string;
        identiFraudValidation: string;
        identiFraudReason: string;
    };
    personalInfo: {
        fullName: string;
        dob: string;
        expires: string;
        fullAddress: string;
        class: string;
        gender: string;
        drivingLicenceNumber: string;
    };
}

export interface VerifiedDrivingProfileResult {
    isDrivingProfileVerified: boolean;
    verifiedDetails: any | null;
}

export interface TripData {
    tripid: string;
    status: string;
    starttime: string;
    endtime: string;
    vehzipcode: string;
    isRentalAgreed: boolean;
    isLicenseVerified: boolean;
    isPhoneVarified: boolean;
    swapDetails: any[];
    driverTripStartingBlobs: string[];
    hostTripStartingBlobs: string[];
    hostFirstName: string;
    hostLastName: string;
    hostPhoneNumber: string;
    hostImage: string;
    [key: string]: any;
}
