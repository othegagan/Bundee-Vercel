'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Component() {
    const [emailContent, setEmailContent] = useState('');
    const [placeholderList, setPlaceholderList] = useState(['name', 'email', 'order_number', 'shipping_address', 'total_amount']);
    const [showPlaceholderMenu, setShowPlaceholderMenu] = useState(false);

    const handleTextareaChange = (e) => {
        const text = e.target.value;
        setEmailContent(text);

        // Check if the cursor is after `{{` in the text
        const cursorPos = e.target.selectionStart;
        const precedingText = text.substring(0, cursorPos);

        if (precedingText.endsWith('{{')) {
            setShowPlaceholderMenu(true);
        } else {
            setShowPlaceholderMenu(false);
        }
    };

    const insertPlaceholder = (placeholder) => {
        const cursorPos = emailContent.indexOf('{{');
        const updatedContent = `${emailContent.slice(0, cursorPos)}{{${placeholder}}}${emailContent.slice(cursorPos + 2)}`;
        setEmailContent(updatedContent);
        setShowPlaceholderMenu(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Template Editor</CardTitle>
                <CardDescription>Customize your email template by adding dynamic placeholders.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='relative'>
                    <Textarea
                        value={emailContent}
                        onChange={handleTextareaChange}
                        placeholder='Type your email content here...'
                        className='min-h-[200px] resize-none'
                    />
                    {showPlaceholderMenu && (
                        <div className='absolute top-0 left-0 z-10 bg-background border rounded-md shadow-lg p-2 w-[200px]'>
                            <div className='space-y-2'>
                                {placeholderList.map((placeholder) => (
                                    <Button key={placeholder} variant='ghost' onClick={() => insertPlaceholder(placeholder)} className='w-full justify-start'>
                                        {placeholder}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button>Save Template</Button>
            </CardFooter>
        </Card>
    );
}
