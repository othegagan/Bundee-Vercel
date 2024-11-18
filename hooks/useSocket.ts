import { useCallback, useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

export interface SocketMessage {
    type: string;
    sessionId?: string;
    [key: string]: any; // For flexibility with other payloads
}

interface UseSocketReturn {
    status: string;
    emitEvent: (event: string, data: any) => void;
    subscribe: (callback: (message: SocketMessage) => void) => void;
    unsubscribe: () => void;
}

export function useSocket(url: string, sessionId?: string): UseSocketReturn {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<string>('connecting');
    const [onMessageCallback, setOnMessageCallback] = useState<((message: SocketMessage) => void) | null>(null);

    useEffect(() => {
        const socketio = io(url);

        socketio.on('connect', () => {
            setStatus('connected');

            // Emit a session-related event if sessionId is provided
            if (sessionId) {
                socketio.emit(
                    'message',
                    JSON.stringify({
                        type: sessionId ? 'MOBILE_CONNECT' : 'DESKTOP_CONNECT',
                        sessionId
                    })
                );
            }
        });

        socketio.on('message', (data: string) => {
            const message = JSON.parse(data) as SocketMessage;

            // Pass message to the subscribed callback, if set
            if (onMessageCallback) {
                onMessageCallback(message);
            }
        });

        socketio.on('disconnect', () => {
            setStatus('disconnected');
        });

        setSocket(socketio);

        return () => {
            socketio.disconnect();
        };
    }, [url, sessionId]);

    const emitEvent = useCallback(
        (event: string, data: any) => {
            if (socket) {
                socket.emit(event, JSON.stringify(data));
            }
        },
        [socket]
    );

    const subscribe = useCallback((callback: (message: SocketMessage) => void) => {
        setOnMessageCallback(() => callback);
    }, []);

    const unsubscribe = useCallback(() => {
        setOnMessageCallback(null);
    }, []);

    return { status, emitEvent, subscribe, unsubscribe };
}
