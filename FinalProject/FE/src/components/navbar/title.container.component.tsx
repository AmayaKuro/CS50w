"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';

import { type ConversationTitleProps, useConversation } from '@/assets/providers/conversation';
import { BackendFetch } from '@/assets/fetch/BE';

import styles from '@/css/navbar/title.module.css'


type TitleSectionProps = {
    conversation_id: string;
    mouseX: number;
    mouseY: number;
};

const TitleContainer: React.FC = () => {
    const { state: { conversationTitles, currentResponseProps }, dispatch: { setConversationTitles } } = useConversation();
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);
    const [anchorTitleSelected, setAnchorTitleSelected] = useState<TitleSectionProps>();
    const [deleting, setDeleting] = useState(false);

    const { data: session } = useSession();

    const router = useRouter();

    const open = Boolean(anchorTitleSelected);

    useEffect(() => {
        if (!session?.access_token || hasFetched) {
            return
        }

        BackendFetch('/conversations', {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(res.statusText);
                }

                return res.json();
            })
            .then((res: ConversationTitleProps[]) => {
                setConversationTitles(res);
                setHasFetched(true);
                setLoading(false);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [session, hasFetched]);

    const handleDelete = useCallback(() => {
        const conversation_id = anchorTitleSelected?.conversation_id;

        if (!session?.access_token || !conversation_id) return;

        setDeleting(true);

        BackendFetch(`/conversation`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            body: {
                conversation_id: conversation_id,
            },
        }).then((e) => {
            if (e.ok) {
                if (currentResponseProps.conversation_id === conversation_id) {
                    router.push('/chats');
                }

                setConversationTitles((prev) => prev.filter((conversationTitle) => conversationTitle.conversation_id !== conversation_id));
                setDeleting(false);
                handleClose();
            } else {
                throw new Error('Failed to delete conversation');
            }
        }).catch((err) => {
            setDeleting(false);
        });
    }, [session?.access_token, currentResponseProps.conversation_id, anchorTitleSelected?.conversation_id])

    const handleRightClick = useCallback((event: React.MouseEvent<HTMLButtonElement>, conversation_id: string) => {
        setAnchorTitleSelected({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 2,
            conversation_id: conversation_id,
        });
    }, []);


    const handleClose = useCallback(() => {
        setAnchorTitleSelected(undefined);
    }, []);


    return (
        <>
            <div className={styles.newConvContainer}>
                <Button
                    className={styles.newConvBtn}
                    size="large"
                    startIcon={<AddIcon />}
                    color='secondary'
                    onClick={() => router.push("/chats")}>New Chat</Button>
            </div>

            <div className={styles.titleContainer}>
                {loading &&
                    <div className={styles.loadingContainer}>
                        <CircularProgress />
                    </div>
                }

                {conversationTitles.map((conversationTitle) => (
                    <Button
                        key={conversationTitle.conversation_id}
                        startIcon={<ChatBubbleOutlineIcon />}
                        onClick={() => router.push(`/chats/${conversationTitle.conversation_id}`)}
                        style={{
                            width: '100%',
                            textTransform: 'initial'
                        }}
                        {...(conversationTitle.conversation_id === currentResponseProps.conversation_id)
                            ? { className: styles.selected }
                            : {}
                        }
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleRightClick(e, conversationTitle.conversation_id);
                        }}
                    >
                        <span >
                            {conversationTitle.title}
                        </span>
                    </Button>
                ))}
                <Popover
                    open={open}
                    anchorReference='anchorPosition'
                    anchorPosition={{
                        top: anchorTitleSelected?.mouseY ?? 0,
                        left: anchorTitleSelected?.mouseX ?? 0,
                    }}
                    onClose={handleClose}
                >
                    <LoadingButton
                        startIcon={<DeleteIcon />}
                        style={{ textTransform: 'initial' }}
                        onClick={() => handleDelete()}
                        loading={deleting}
                    >
                        Delete this conversation?
                    </LoadingButton>
                </Popover>
            </div>
        </>
    );
};

export default TitleContainer;
