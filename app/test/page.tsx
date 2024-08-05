'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';

export default function page() {
    const drivngLicenceDialog = useDrivingLicenceDialog();

    return (
        <div>
            <button type='button' onClick={() => drivngLicenceDialog.onOpen()}>
                Open Driving Licence Dialog
            </button>
        </div>
    );
}
