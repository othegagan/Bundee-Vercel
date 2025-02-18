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
    version: number;
    statusCode: string;
    reservationid: number;
    channelId: number;
    channelName: string;
    starttime: string;
    endtime: string;
    status: string;

    delivery: boolean;
    airportDelivery: boolean;
    isRentalAgreed: boolean;
    rentalAgreedDate: string;
    isLicenseVerified: boolean;
    isPhoneVarified: boolean;
    drivingLicenseStatus: string;
    isInsuranceVerified: boolean;
    insuranceStatus: any;
    invoiceUrl: string | null;
    rentalAgrrementUrl: string | null;

    userid: number;
    userFirstName: string | null;
    userlastName: string | null;
    userImage: string | null;
    userEmail: string | null;
    userMobilePhone: string | null;

    vehicleId: number;
    vehicleImages: VehicleImage[] | [];
    vehicleNumber: string;
    vehmake: string;
    vehmodel: string;
    vehyear: string;
    vehcityname: string | null;
    vehzipcode: string;
    vehaddress1: string | null;
    vehaddress2: string | null;
    vehstate: string | null;
    vehicleDetails: Vehicle[];

    hostid: number;
    hostFirstName: string | null;
    hostLastName: string | null;
    hostPhoneNumber: string | null;
    hostImage: string | null;

    hostTripStartingBlobs: any[];
    hostTripCompletingBlobs: any[];
    driverTripStartingBlobs: any[];
    driverTripCompletingBlobs: any[];

    isDebitCard: boolean;
    cardDetails: CardDetail[];
    paymentFailedReason: string | null;
    paymentFailed: boolean;
    actualstarttime: string | null;
    actualendttime: string | null;
    tripstatus: number;
    openingMiles: number;
    closingMiles: number;

    isactive: boolean;

    tripCount: string | null;
    pickupLocation: string | null;
    logCompleted: string | number | null;
    unreadMsgCount: string | number | null;

    cancellationDays: number;
    bookingId: string;
    message: string | null;
    createddate: string;
    updateddate: string;

    tripModificationHistories: any[];
    swapDetails: any[];
    tripPaymentTokens: Pricelist[];
    paymentTransactions: any[];
    successfullPaymentTransactions: any[];
    cancelresponse: any[];
    tripSlipPayments: any[];
    rentalCharges: any[];
    tripChargeLedgers: any[];
    paymentCaptures: any[];
    tripPayementAuthResponses: any[];
    tripModificationDetails: any[];
    tripStatusTransactionResponses: any[];
    transactionCheckLists: any[];
    tripConstraints: any[];
    completedDate: string;
    depositCollected?: boolean;
    [key: string]: any;
}

export interface VehicleImage {
    idimage: number;
    orderNumber: number;
    isPrimary: boolean;
    vehicleid: number;
    imagename: string;
    userid: number;
    isactive: boolean;
    createdate: string;
    updatedate: string;
    imageUuid: string | null;
}

interface CardDetail {
    id: number;
    userId: number;
    tripId: number;
    oldMethodIdToken: string;
    newMethodIdToken: string;
    createdDate: string;
    updatedDate: string | null;
    isActive: boolean;
    cardType: 'credit' | 'debit' | 'prepaid' | 'other'; // Extend as needed
    last4Digit: string;
    cardBrand: string;
}

interface Pricelist {
    capturedDays: number;
    depositHoldAmount: number;
    chargedAmountOnHold: number;
    id: number;
    reservationid: number;
    userid: number;
    hostid: number;
    channelid: number;
    vehicleid: number;
    deductionfrequencyconfigid: number;
    paymentauthorizationconfigid: number;
    authorizationamount: number;
    authorizationpercentage: number;
    releasedAmountOnHold: number;
    totaldays: number;
    perdayamount: number;
    totalamount: number;
    createddate: string;
    updateddate: any;
    tripid: number;
    strippaymenttoken: string;
    strippaymentid: string;
    strippaymenttokenactiveflag: boolean;
    isactive: boolean;
    paymentrecieveddate: string;
    stripetransactiondetails: string;
    paymentmethodidtoken: string;
    customertoken: string;
    setupIntentToken: string;
    tripAmount: number;
    taxAmount: number;
    tripTaxAmount: number;
    discountedDays: number;
    discountPercentage: number;
    discountAmount: number;
    tripDiscountedAmount: number;
    upCharges: number;
    deliveryCost: number;
    tripFee: number;
    charges: number;
    taxPercentage: number;
    numberOfDaysDiscount: number;
    concessionCalculated: number;
    concessionPercentage: number;
    concessionFee: number;
    registrationRecoveryFee: number;
    extreaMilageCost: number;
    Statesurchargetax: number;
    Statesurchargeamount: number;
    tripFeeAmount: number;
    capturedAmount: number;
    refundAmount: number;
    extraMileageCost: number;
    extraMilage: number;
    lateFee: number;
    extraDayCharges: number;
    registrationFee: number;
    averageRentalDays: number;
}

export interface SocketMessage {
    type: string;
    sessionId?: string;
    verified?: boolean;
    [key: string]: any;
}

export interface UseSocketReturn {
    status: string;
    error: string;
    sessionId: string | null;
    mobileUrl: string;
    retryConnection: () => void;
}
