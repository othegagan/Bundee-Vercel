'use client';

import { useCallback, useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

export interface SocketMessage {
    type: string;
    sessionId?: string;
    verified?: boolean;
    [key: string]: any;
}

interface UseSocketConnectionProps {
    serverUrl: string;
    isMobile: boolean;
    sessionId?: string;
}

interface UseSocketConnectionReturn {
    socket: Socket | null;
    error: string;
    status: string;
    sessionId: string | null;
    mobileUrl: string;
    handleVerify: (isVerified: boolean) => void;
    handleRetry: () => void;
}

export function useSocket({ serverUrl, isMobile, sessionId: initialSessionId }: UseSocketConnectionProps): UseSocketConnectionReturn {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState('connecting');
    const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
    const [mobileUrl, setMobileUrl] = useState('');
    const [interactionOccurred, setInteractionOccurred] = useState(false);

    // Store the initial session ID in a ref to avoid dependency issues
    useEffect(() => {
        const socketio = io(serverUrl, {
            reconnectionAttempts: 3,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        socketio.on('connect', () => {
            console.log('Connected to websocket');
            setStatus('connected');
            // Only emit if we have the necessary data
            if (isMobile && initialSessionId) {
                socketio.emit('message', JSON.stringify({ type: 'MOBILE_CONNECT', sessionId: initialSessionId }));
            } else if (!isMobile) {
                socketio.emit('message', JSON.stringify({ type: 'DESKTOP_CONNECT' }));
            }
        });

        socketio.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server. Please check your internet connection and try again.');
            setStatus('error');
        });

        socketio.on('message', (data: string) => {
            try {
                const message: SocketMessage = JSON.parse(data);
                console.log('Received message:', message);

                switch (message.type) {
                    case 'SESSION_ID':
                        if (message.sessionId) {
                            setSessionId(message.sessionId);
                            setStatus('waiting');
                            setMobileUrl(`${window.location.origin}/mobile-verify/${message.sessionId}`);
                        }
                        break;
                    case 'MOBILE_CONNECTED':
                        setStatus('mobile_connected');
                        break;
                    case 'VERIFY_STATUS':
                        setStatus(message.verified ? 'verified' : 'failed');
                        break;
                    case 'SESSION_DESTROYED':
                        setStatus('session_destroyed');
                        setSessionId(null);
                        setMobileUrl('');
                        break;
                    case 'VERIFY_COMPLETE':
                        setStatus('verified');
                        break;
                }
            } catch (err) {
                console.error('Error parsing message:', err);
                setError('Invalid message format received');
            }
        });

        setSocket(socketio);

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isMobile && !interactionOccurred && initialSessionId) {
                socketio.emit(
                    'message',
                    JSON.stringify({
                        type: 'DESTROY_SESSION',
                        sessionId: initialSessionId
                    })
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socketio.disconnect();
        };
    }, [serverUrl, isMobile, initialSessionId]); // Remove sessionId from dependencies

    const handleVerify = useCallback(
        (isVerified: boolean) => {
            setInteractionOccurred(true);
            if (socket && initialSessionId) {
                socket.emit(
                    'message',
                    JSON.stringify({
                        type: 'VERIFY_STATUS',
                        sessionId: initialSessionId,
                        verified: isVerified
                    })
                );
                setStatus(isVerified ? 'verified' : 'failed');
            } else {
                setError('No active connection to server');
            }
        },
        [socket, initialSessionId]
    );

    const handleRetry = useCallback(() => {
        if (socket) {
            setStatus('connecting');
            setError('');
            if (isMobile && initialSessionId) {
                socket.emit(
                    'message',
                    JSON.stringify({
                        type: 'MOBILE_CONNECT',
                        sessionId: initialSessionId
                    })
                );
            } else if (!isMobile) {
                socket.emit('message', JSON.stringify({ type: 'DESKTOP_CONNECT' }));
            }
        } else {
            window.location.reload();
        }
    }, [socket, isMobile, initialSessionId]);

    return { socket, error, status, sessionId, mobileUrl, handleVerify, handleRetry };
}
