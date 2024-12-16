'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateAndTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { useState } from 'react';

interface TripPaymentScheduleProps {
    paymentSchedule: any[] | null;
    zipCode: string;
}

export default function TripPaymentSchedule({ paymentSchedule, zipCode }: TripPaymentScheduleProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
    }

    if (paymentSchedule?.length === 0 || !paymentSchedule) return null;

    return (
        <>
            <button type='button' onClick={openModal} className='flex items-center gap-2 p-0 text-blue-600 underline underline-offset-2'>
                View Schedule
            </button>

            <Dialog isOpen={isModalOpen} openDialog={openModal} closeDialog={closeModal} title='Payment Schedule' className='lg:max-w-3xl'>
                <DialogBody>
                    <p>A breakdown of your rental payments, including amounts and due dates for a hassle-free rental experience.</p>

                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[100px]'>Sl.No</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className='text-right'>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentSchedule?.map((payment, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='font-medium'>{index + 1}</TableCell>
                                        <TableCell>$ {roundToTwoDecimalPlaces(payment.paymentAmount)}</TableCell>
                                        <TableCell>{formatDateAndTime(payment.paymentDate, zipCode, 'MMM DD YYYY, h:mm A z')}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.paymentStatus} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button size='sm' type='button' variant='black' onClick={closeModal}>
                        OK
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'Upcoming':
            return <Badge className='flex w-full items-center justify-center rounded-sm bg-yellow-600 text-center'>Upcoming</Badge>;
        case 'Paid':
            return <Badge className='flex w-full items-center justify-center rounded-sm bg-green-600 text-center'>Paid</Badge>;
        case 'Failed':
            return <Badge className='flex w-full items-center justify-center rounded-sm bg-red-500 text-center'>Failed</Badge>;
        default:
            return null;
    }
}
