'use client';

import { BsFillShieldLockFill, BsTelephoneFill } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';

import OtpInput from 'otp-input-react';
import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';
import { PhoneInput } from '@/components/ui/phone-input';
import { Country, formatPhoneNumber, formatPhoneNumberIntl, getCountryCallingCode } from 'react-phone-number-input';

const App = () => {
    const phoneNumberVerification = usePhoneNumberVerificationModal();
    const [otp, setOtp] = useState('');
    const [ph, setPh] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [user, setUser] = useState(null);
    const [country, setCountry] = useState<Country>();

    function onSignup() {
        setLoading(true);

        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: response => {},
            'expired-callback': () => {},
        });

        const formatPh = '+' + ph;

        signInWithPhoneNumber(auth, formatPh, appVerifier)
            .then(confirmationResult => {
                //@ts-ignore
                window.confirmationResult = confirmationResult;
                setLoading(false);
                setShowOTP(true);
                toast({
                    variant: 'success',
                    description: 'OTP sended successfully!',
                });
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    function onOTPVerify() {
        setLoading(true);
        //@ts-ignore
        window.confirmationResult
            .confirm(otp)
            .then(async res => {
                setUser(res.user);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
                toast({
                    variant: 'destructive',
                    description: 'Wrong OTP!',
                });
                setOtp('');
            });
    }

    function openModal() {
        phoneNumberVerification.onOpen();
    }

    return (
        // <section className='flex h-screen items-center justify-center bg-emerald-500'>
        //     <div>
        //         <div id='recaptcha-container'></div>
        //         {user ? (
        //             <h2 className='text-center text-2xl font-medium text-white'>👍Login Success</h2>
        //         ) : (
        //             <div className='flex w-80 flex-col gap-4 rounded-lg p-4'>
        //                 <h1 className='mb-6 text-center text-3xl font-medium leading-normal text-white'>
        //                     Welcome to <br /> CODE A PROGRAM
        //                 </h1>
        //                 {showOTP ? (
        //                     <>
        //                         <div className='mx-auto w-fit rounded-full bg-white p-4 text-emerald-500'>
        //                             <BsFillShieldLockFill size={30} />
        //                         </div>
        //                         <label htmlFor='otp' className='text-center text-xl font-bold text-white'>
        //                             Enter your OTP
        //                         </label>
        //                         <OtpInput
        //                             value={otp}
        //                             onChange={setOtp}
        //                             OTPLength={6}
        //                             otpType='number'
        //                             disabled={false}
        //                             autoFocus
        //                             className='opt-container '></OtpInput>
        //                         <button
        //                             onClick={onOTPVerify}
        //                             className='flex w-full items-center justify-center gap-1 rounded bg-emerald-600 py-2.5 text-white'>
        //                             {loading && <CgSpinner size={20} className='mt-1 animate-spin' />}
        //                             <span>Verify OTP</span>
        //                         </button>
        //                     </>
        //                 ) : (
        //                     <>
        //                         <div className='mx-auto w-fit rounded-full bg-white p-4 text-emerald-500'>
        //                             <BsTelephoneFill size={30} />
        //                         </div>
        //                         <label htmlFor='' className='text-center text-xl font-bold text-white'>
        //                             Verify your phone number
        //                         </label>
        //                         <PhoneInput country={'in'} value={ph} onChange={setPh} />
        //                         <button onClick={onSignup} className='flex w-full items-center justify-center gap-1 rounded bg-emerald-600 py-2.5 text-white'>
        //                             {loading && <CgSpinner size={20} className='mt-1 animate-spin' />}
        //                             <span>Send code via SMS</span>
        //                         </button>
        //                     </>
        //                 )}
        //             </div>
        //         )}
        //     </div>

        //     <br />
        // </section>

        <>
            <Button type='button' onClick={openModal}>
                Open
            </Button>
        </>
    );
};

export default App;
