'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { BookmarkIcon, CheckIcon, RefreshCcwIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { LLM_MODELS } from '@/lib/data';
import { useStore } from '@/lib/hooks';
import { useKGStore } from '@/lib/hooks/use-kg-store';
import type { KGUIMessage } from '@/lib/kg-chat-types';
import { buildNodeSearchIndex, buildPropertySearchIndex, KG_TOOLS, type ToolContext } from '@/lib/kg-tools';
import { generateSessionId, getUserId } from '@/lib/langfuse-tracking';
import { cn, envURL } from '@/lib/utils';
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from '../ai-elements/checkpoint';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageAvatar,
  MessageContent,
  MessageCopyAction,
  MessageResponse,
} from '../ai-elements/message';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '../ai-elements/model-selector';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '../ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ai-elements/reasoning';
import { ActivityTimeline, ExecutionPlan, ToolDrawer } from './ResearchAssistant';

type CheckpointType = {
  id: string;
  messageIndex: number;
  timestamp: Date;
  messageCount: number;
};

export interface KGChatProps {
  onChatOpen?: (isOpen: boolean) => void;
  children?: (props: KGChatRenderProps) => React.ReactNode;
}

export interface KGChatRenderProps {
  // State
  model: string;
  plan: string | null;
  planStatus: 'idle' | 'loading' | 'ready' | 'error';
  planError: string | null;

  // Chat data
  messages: ReturnType<typeof useChat>['messages'];
  status: ReturnType<typeof useChat>['status'];
  checkpoints: CheckpointType[];

  // Handlers
  handleSubmit: (message: PromptInputMessage) => Promise<void>;
  handleDeleteMessages: () => void;
  handleSubmitAction: () => void;
  setModel: (model: (typeof LLM_MODELS)[number]['id']) => void;
  regenerate: () => void;
  createCheckpoint: (messageIndex: number) => void;
  restoreToCheckpoint: (messageIndex: number) => void;

  // Components
  renderMessages: (alert?: { component: React.ReactNode; show: boolean }) => React.ReactNode;
  renderPromptInput: () => React.ReactNode;
}

export function KGChat({ onChatOpen, children }: KGChatProps) {
  const [model, setModel] = React.useState<(typeof LLM_MODELS)[number]['id']>(LLM_MODELS[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = React.useState(false);
  const [checkpoints, setCheckpoints] = React.useState<CheckpointType[]>([]);
  const [plan, setPlan] = React.useState<string | null>(null);
  const [planStatus, setPlanStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [planError, setPlanError] = React.useState<string | null>(null);
  const planRequestId = React.useRef(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Generate unique IDs for Langfuse session tracking
  const sessionId = React.useMemo(() => generateSessionId(), []);

  const { messages, setMessages, sendMessage, status, regenerate, stop, clearError, addToolOutput } =
    useChat<KGUIMessage>({
      transport: new DefaultChatTransport({
        api: `${envURL(process.env.NEXT_PUBLIC_LLM_BACKEND_URL)}/kg-chat`,
      }),
      onError(error) {
        toast.error('Failed to fetch response from LLM', {
          cancel: { label: 'Close', onClick() {} },
          description: error.message || 'LLM server is not responding. Please try again later.',
        });
      },
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        // Type narrowing: Skip dynamic tools (not supported in our registry)
        if (toolCall.dynamic) {
          return;
        }

        // CRITICAL: Build indexes fresh on each tool call to capture latest state
        // This ensures we always use the most up-to-date sigmaInstance, kgPropertyOptions, and radioOptions
        // which may have been loaded/updated after the component mounted
        const currentSigmaInstance = useKGStore.getState().sigmaInstance;
        const currentKgPropertyOptions = useKGStore.getState().kgPropertyOptions;
        const currentRadioOptions = useStore.getState().radioOptions;

        if (!currentSigmaInstance) {
          throw new Error('Graph not loaded. Please upload or load a knowledge graph first.');
        }

        const graph = currentSigmaInstance.getGraph();

        // Build fresh indexes with latest data
        const graphSearchIndex = buildNodeSearchIndex(graph);
        const propertySearchIndex = buildPropertySearchIndex(currentKgPropertyOptions || {}, currentRadioOptions);

        // Build tool context with fresh indexes
        const toolContext: ToolContext = {
          store: useKGStore.getState(),
          legacy_store: useStore.getState(),
          graphSearchIndex,
          propertySearchIndex,
        };

        try {
          // Get tool function from registry
          const toolFn = KG_TOOLS[toolCall.toolName as keyof typeof KG_TOOLS];

          if (!toolFn) {
            throw new Error(`Tool '${toolCall.toolName}' not found in registry`);
          }

          const result = await toolFn(toolCall.input as any, toolContext);

          // Check if tool execution was successful
          if (!result.success) {
            throw new Error(result.error || 'Tool execution failed');
          }

          // Add successful output to chat (only the data, not the wrapper)
          addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: result.data as any,
          });

          // Apply visual updates if tool returned them
          if (result.visualUpdate) {
            const { visualUpdate } = result;

            // Highlight nodes
            if (visualUpdate.highlightedNodes) {
              for (const nodeId of visualUpdate.highlightedNodes) {
                if (graph.hasNode(nodeId)) {
                  graph.updateNodeAttributes(nodeId, attrs => {
                    attrs.highlighted = true;
                    attrs.zIndex = 100;
                    return attrs;
                  });
                }
              }
            }

            // Highlight edges
            if (visualUpdate.highlightedEdges) {
              for (const edgeId of visualUpdate.highlightedEdges) {
                if (graph.hasEdge(edgeId)) {
                  graph.updateEdgeAttributes(edgeId, attrs => {
                    attrs.highlighted = true;
                    attrs.zIndex = 100;
                    return attrs;
                  });
                }
              }
            }

            // Animate camera to target
            if (visualUpdate.cameraTarget) {
              const camera = currentSigmaInstance.getCamera();
              camera.animate(
                {
                  x: visualUpdate.cameraTarget.x,
                  y: visualUpdate.cameraTarget.y,
                  ratio: visualUpdate.cameraTarget.ratio || 0.5,
                },
                { duration: 500 },
              );
            }

            // Refresh sigma to apply visual changes
            currentSigmaInstance.refresh();
          }
        } catch (error) {
          // Handle errors gracefully - show error toast
          const errorText = error instanceof Error ? error.message : String(error);
          toast.error('Tool execution failed', {
            description: errorText,
            cancel: { label: 'Close', onClick() {} },
          });

          // Also add error output to chat for context
          addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText,
          });
        }
      },
    });

  // Checkpoint management functions
  const createCheckpoint = React.useCallback((messageIndex: number) => {
    const checkpoint: CheckpointType = {
      id: `checkpoint-${Date.now()}-${messageIndex}`,
      messageIndex,
      timestamp: new Date(),
      messageCount: messageIndex + 1,
    };
    setCheckpoints(prev => [...prev, checkpoint]);
  }, []);

  const restoreToCheckpoint = React.useCallback(
    (messageIndex: number) => {
      // Restore messages to checkpoint state
      setMessages(messages.slice(0, messageIndex + 1));
      // Remove checkpoints after this point
      setCheckpoints(prev => prev.filter(cp => cp.messageIndex <= messageIndex));
      toast.success('Checkpoint restored', {
        description: `Conversation restored to ${messageIndex + 1} messages`,
      });
    },
    [messages, setMessages],
  );

  const fetchPlan = React.useCallback(
    async (messageText: string | undefined, selectedNodeContext: { id: string; label: string }[], userId: string) => {
      const trimmedText = messageText?.trim();

      if (!trimmedText) {
        setPlan(null);
        setPlanStatus('idle');
        setPlanError(null);
        return null;
      }

      const requestId = planRequestId.current + 1;
      planRequestId.current = requestId;
      setPlanStatus('loading');
      setPlanError(null);
      setPlan(null);

      try {
        const response = await fetch(`${envURL(process.env.NEXT_PUBLIC_LLM_BACKEND_URL)}/kg-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmedText,
            model,
            sessionId,
            userId,
            selectedNodeContext,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate plan (${response.status})`);
        }

        const data = (await response.json()) as { plan?: string };
        const nextPlan = typeof data.plan === 'string' ? data.plan : null;

        if (requestId !== planRequestId.current) {
          return null;
        }

        if (!nextPlan) {
          setPlan(null);
          setPlanStatus('error');
          setPlanError('Plan unavailable.');
          return null;
        }

        setPlan(nextPlan);
        setPlanStatus('ready');
        return nextPlan;
      } catch (error) {
        if (requestId !== planRequestId.current) {
          return null;
        }

        const errorText = error instanceof Error ? error.message : 'Failed to generate plan.';
        setPlan(null);
        setPlanStatus('error');
        setPlanError(errorText);
        return null;
      }
    },
    [model, sessionId],
  );

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    onChatOpen?.(true);

    // Get currently selected nodes from KG store
    const selectedNodes = useKGStore.getState().selectedNodes || [];
    const graph = useKGStore.getState().sigmaInstance?.getGraph();
    const selectedNodeContext = selectedNodes.map(nodeId => {
      const label = graph?.getNodeAttribute(nodeId, 'label') || nodeId;
      return { id: nodeId, label };
    });
    const userId = getUserId();
    const planText = await fetchPlan(message.text, selectedNodeContext, userId);

    sendMessage(
      { text: message.text, files: message.files },
      {
        body: {
          model,
          sessionId,
          userId,
          selectedNodeContext,
          ...(planText ? { plan: planText } : {}),
        },
      },
    );
  };

  const handleDeleteMessages = () => {
    setMessages([]);
    setCheckpoints([]);
    onChatOpen?.(false);
  };

  const handleSubmitAction = () => {
    if (status === 'submitted' || status === 'streaming') {
      stop();
    } else if (status === 'error') {
      setMessages(messages.slice(0, -1));
      clearError();
    }
  };

  const renderMessages = (alert?: { component: React.ReactNode; show: boolean }) => (
    <Conversation className='h-full'>
      <ConversationContent>
        {messages.map((message, messageIndex) => {
          const checkpoint = checkpoints.find(cp => cp.messageIndex === messageIndex);
          const hasAttachments = message.parts.some(part => part.type === 'file');

          return (
            <React.Fragment key={message.id}>
              <div className='fade-in slide-in-from-bottom-10 animate-in duration-300'>
                {/* Render attachments if present */}
                {hasAttachments && (
                  <MessageAttachments className='mb-2'>
                    {message.parts
                      .filter(part => part.type === 'file')
                      .map((part, i) => (
                        <MessageAttachment key={`${message.id}-attachment-${i}`} data={part} />
                      ))}
                  </MessageAttachments>
                )}

                {(() => {
                  const textParts = message.parts.filter(part => part.type === 'text');
                  const reasoningParts = message.parts.filter(part => part.type === 'reasoning');
                  const toolParts = message.parts.filter(
                    part =>
                      (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) &&
                      'state' in part &&
                      'input' in part,
                  );

                  const isLatestAssistantMessage =
                    message.role === 'assistant' &&
                    messageIndex === messages.findLastIndex(m => m.role === 'assistant');

                  return (
                    <React.Fragment>
                      {/* 1. Text Message */}
                      {textParts.length > 0 && (
                        <React.Fragment>
                          <Message from={message.role}>
                            <MessageContent className='!bg-transparent !text-gray-900 shadow-none'>
                              <MessageResponse isAnimating={status === 'submitted' && message.role === 'assistant'}>
                                {textParts.map(p => p.text).join('\n')}
                              </MessageResponse>
                            </MessageContent>
                            <MessageAvatar
                              className={cn('shadow', message.role === 'assistant' && 'p-1')}
                              src={message.role === 'user' ? '/image/user.png' : '/image/logo.svg'}
                              name={message.role === 'user' ? 'You' : 'AI'}
                            />
                          </Message>
                          {message.role === 'assistant' && (
                            <MessageActions className='-mt-2 pl-10'>
                              {messages.length - 1 === messageIndex && (
                                <MessageAction onClick={() => regenerate()} label='Retry'>
                                  <RefreshCcwIcon className='size-3' />
                                </MessageAction>
                              )}
                              <MessageCopyAction text={textParts.map(p => p.text).join('\n')} />
                              {!checkpoint && (
                                <MessageAction
                                  onClick={() => createCheckpoint(messageIndex)}
                                  label='Checkpoint'
                                  tooltip='Save this point'
                                >
                                  <BookmarkIcon className='size-3' />
                                </MessageAction>
                              )}
                            </MessageActions>
                          )}
                        </React.Fragment>
                      )}

                      {/* 2. Reasoning */}
                      {reasoningParts.map((part, i) => (
                        <Reasoning
                          key={`${message.id}-reasoning-${i}`}
                          className='w-full'
                          isStreaming={status === 'streaming' && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent className='rounded-md border p-2 text-black'>{part.text}</ReasoningContent>
                        </Reasoning>
                      ))}

                      {/* 3. Activity Timeline */}
                      {message.role === 'assistant' && <ActivityTimeline toolParts={toolParts} />}

                      {/* 4. Execution Plan */}
                      {message.role === 'assistant' && (
                        <ExecutionPlan plan={isLatestAssistantMessage ? plan : null} toolParts={toolParts} />
                      )}

                      {/* 5. Tool Drawer */}
                      {message.role === 'assistant' && <ToolDrawer toolParts={toolParts} />}
                    </React.Fragment>
                  );
                })()}
              </div>

              {/* Render checkpoint if it exists at this message */}
              {checkpoint && (
                <Checkpoint className='my-4'>
                  <CheckpointIcon />
                  <CheckpointTrigger onClick={() => restoreToCheckpoint(checkpoint.messageIndex)}>
                    Restore checkpoint ({checkpoint.messageCount} messages)
                  </CheckpointTrigger>
                </Checkpoint>
              )}
            </React.Fragment>
          );
        })}
        {alert?.show && alert?.component}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );

  const renderPromptInput = () => {
    // Get the selected model data for display
    const selectedModelData = LLM_MODELS.find(m => m.id === model);

    return (
      <PromptInputProvider>
        <PromptInput globalDrop multiple onSubmit={handleSubmit} className='mx-2'>
          <PromptInputAttachments>{attachment => <PromptInputAttachment data={attachment} />}</PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea ref={textareaRef} disabled={status === 'error'} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton textareaRef={textareaRef} />
              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.chefSlug && <ModelSelectorLogo provider={selectedModelData.chefSlug} />}
                    {selectedModelData && <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder='Search models...' />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {['OpenAI', 'DeepSeek AI', 'Meta'].map(chef => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {LLM_MODELS.filter(m => m.chef === chef).map(m => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => {
                              setModel(m.id);
                              setModelSelectorOpen(false);
                            }}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            <ModelSelectorLogoGroup>
                              {m.providers.map(provider => (
                                <ModelSelectorLogo key={provider} provider={provider} />
                              ))}
                            </ModelSelectorLogoGroup>
                            {model === m.id ? (
                              <CheckIcon className='ml-auto size-4' />
                            ) : (
                              <div className='ml-auto size-4' />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit status={status} onClick={handleSubmitAction} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    );
  };

  if (children) {
    return (
      <>
        {children({
          model,
          plan,
          planStatus,
          planError,
          messages,
          status,
          checkpoints,
          handleSubmit,
          handleDeleteMessages,
          handleSubmitAction,
          setModel,
          regenerate,
          createCheckpoint,
          restoreToCheckpoint,
          renderMessages,
          renderPromptInput,
        })}
      </>
    );
  }

  return null;
}
