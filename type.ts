declare namespace NodeJS {
    export interface ProcessEnv {
        SECRET_KEY: string;
        NEXT_PUBLIC_APP_ENV: string;
        CHANNEL_NAME: string;

        NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY: string;
        NEXT_PUBLIC_SECURE_LOCAL_STORAGE_PREFIX: string;

        CHAT_SERVICE_BASEURL: string;
        USER_MANAGEMENT_BASEURL: string;
        HOST_SERVICES_BASEURL: string;
        BOOKING_SERVICES_BASEURL: string;
        AVAILABILITY_BASEURL: string;
        FALLBACK_BUNDEE_AUTH_TOKEN: string;

        MAPBOX_BASE_URL: string;
        MAPBOX_SEARCH_LIMIT: string;
        MAPBOX_SEARCH_COUNTRY: string;
        MAPBOX_RESPONSE_LANGUAGE: string;
        MAPBOX_ACCESS_TOKEN: string;
        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: string;

        STRIPE_BASE_URL: string;
        CREATE_STRIPE_CUSTOMER: string;
        CREATE_PAYMENT_INTENT: string;
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

        PERSONA_BEARER_TOKEN: string;
        NEXT_PUBLIC_IDSCAN_BEARER_TOKEN: string;
        NEXT_PUBLIC_IDSCAN_LICENSE_KEY: string;

        NEXT_PUBLIC_FIREBASE_APIKEY: string;
        NEXT_PUBLIC_FIREBASE_AUTHDOMAIN: string;
        NEXT_PUBLIC_FIREBASE_PROJECTID: string;
        NEXT_PUBLIC_FIREBASE_STORAGEBUCKET: string;
        NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID: string;
        NEXT_PUBLIC_FIREBASE_APPID: string;
        FIREBASE_VAPID_KEY: string;
    }
}
