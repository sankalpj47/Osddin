import { Trash2Icon, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { ChatBase } from './ChatBase';

export function Chat() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <ChatBase onChatOpen={setIsChatOpen}>
      {({ handleDeleteMessages, renderMessages, renderPromptInput }) => (
<div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className='flex items-center gap-3 border-b border-gray-100 px-5 py-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600'>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='3' y='11' width='18' height='10' rx='2' />
                <circle cx='12' cy='5' r='2' />
                <line x1='12' y1='7' x2='12' y2='11' />
                <line x1='8' y1='15' x2='8' y2='15' strokeWidth='3' strokeLinecap='round' />
                <line x1='12' y1='15' x2='12' y2='15' strokeWidth='3' strokeLinecap='round' />
                <line x1='16' y1='15' x2='16' y2='15' strokeWidth='3' strokeLinecap='round' />
              </svg>
            </div>
            <div>
              <h2 className='text-sm font-semibold text-gray-900'>AI Assistant</h2>
              <p className='text-xs text-gray-500'>Ask questions about your gene network and get instant insights</p>
            </div>
            {isChatOpen && (
              <button
                type='button'
                onClick={handleDeleteMessages}
                className='ml-auto text-gray-400 hover:text-gray-600 transition-colors'
                title='Clear chat'
              >
                <Trash2Icon className='size-4' />
              </button>
            )}
          </div>

    {/* Message area */}
<div className="flex flex-1 min-h-0 flex-col">
  {isChatOpen ? (
    <div className="flex-1 min-h-0">
      {renderMessages()}
    </div>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
        <Lightbulb className="size-7 text-teal-500" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">
          Ask me anything
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Get insights about your gene interactions and network
        </p>
      </div>
    </div>
  )}
</div>

          {/* Input */}
          <div className='w-full px-4 py-3'>
            <div className='w-full'>
              {renderPromptInput()}
            </div>
          </div>

          {/* Disclaimer */}
          <div className='px-2 pb-4 text-center text-xs text-gray-400 leading-relaxed'>
            This AI may generate incorrect information. By using this service, you agree to our{' '}
            <Link href='/docs/terms-of-use' className='underline underline-offset-2 hover:text-gray-600 transition-colors'>
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link href='/docs/privacy-policy' className='underline underline-offset-2 hover:text-gray-600 transition-colors'>
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      )}
    </ChatBase>
  );
}