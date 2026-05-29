import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  observe,
  updateActiveTrace,
} from '@langfuse/tracing';

import { LlmService } from './llm.service';

import {
  LangGraphService as LangGraphLlmService,
} from './a';

import {
  PromptDto,
  DEFAULT_MODEL,
} from '@/llm/model.constants';

import { ThrottlerBehindProxyGuard } from './llm-throttle.guard';

type TraceRequest = PromptDto & {
  model?: string;
  messages?: Array<unknown>;
  userId?: string;
  sessionId?: string;
};

type KGChatRequest = PromptDto & {
  plan?: string;
};

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,

    private readonly kgLlmService: LangGraphLlmService,
  ) {}

  private toTraceRequest(
    promptDto: PromptDto,
  ) {
    return promptDto as TraceRequest;
  }

  // =========================================================
  // NORMAL CHAT
  // =========================================================

  @Post('chat')
  @UseGuards(ThrottlerBehindProxyGuard)
  async streamResponse(
    @Body() promptDto: PromptDto,
    @Res() res: Response,
  ) {
    const request =
      this.toTraceRequest(promptDto);

    return observe(
      async () => {
        try {
          updateActiveTrace({
            name: 'llm-chat-request',

            userId: request.userId,

            sessionId:
              request.sessionId,

            metadata: {
              model:
                request.model ||
                DEFAULT_MODEL,

              messageCount:
                request.messages
                  ?.length || 0,
            },
          });

          const result =
            this.llmService.generateResponseStream(
              promptDto,
            );

          return result.pipeUIMessageStreamToResponse(
            res,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to generate response stream';

          throw new HttpException(
            errorMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },

      {
        name: 'handle-llm-chat',

        captureInput: true,

        captureOutput: false,

        endOnExit: false,
      },
    )();
  }

  @Post('kg-plan')
  @UseGuards(ThrottlerBehindProxyGuard)
  async generateKGPlan(
    @Body() promptDto: PromptDto,
  ) {

  
    const request =
      this.toTraceRequest(promptDto);
      console.log("kg plan request", promptDto);

    return observe(
      async () => {
        try {
          updateActiveTrace({
            name: 'kg-plan-request',

            userId: request.userId,

            sessionId:
              request.sessionId,

            metadata: {
              model:
                request.model ||
                DEFAULT_MODEL,

              messageCount:
                request.messages
                  ?.length || 0,
            },
          });

          const plan =
            await this.kgLlmService.generateKGPlan(
              promptDto,
            );

          return {
            success: true,
            plan,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to generate KG plan';

          throw new HttpException(
            errorMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },

      {
        name: 'handle-kg-plan',

        captureInput: true,

        captureOutput: true,

        endOnExit: true,
      },
    )();
  }

  // =========================================================
  // KG CHAT STREAM API
  // =========================================================

  @Post('kg-chat')
  @UseGuards(ThrottlerBehindProxyGuard)
  async streamKGChat(
    @Body() promptDto: KGChatRequest,
    @Res() res: Response,
  ) {
    console.log("kg chat request", promptDto);
    const request =
      this.toTraceRequest(promptDto);

    return observe(
      async () => {
        try {
          updateActiveTrace({
            name: 'kg-chat-request',

            userId: request.userId,

            sessionId:
              request.sessionId,

            metadata: {
              model:
                request.model ||
                DEFAULT_MODEL,

              messageCount:
                request.messages
                  ?.length || 0,

              hasPlan:
                !!promptDto.plan,
            },
          });

          const plan =
            promptDto.plan ??
            `
1. Inspect graph state
2. Run graph tools
3. Validate findings
4. Synthesize response
`;

          const result =
            await this.kgLlmService.generateKGChatStreamWithPlan(
              promptDto,
              plan,
            );

          return result.pipeUIMessageStreamToResponse(
            res,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to generate KG chat stream';

          throw new HttpException(
            errorMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },

      {
        name: 'handle-kg-chat',

        captureInput: true,

        captureOutput: false,

        endOnExit: false,
      },
    )();
  }
}