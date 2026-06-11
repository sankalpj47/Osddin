
// import { webcrypto } from 'crypto';

// const globalCrypto = globalThis as typeof globalThis & {
//   crypto?: Crypto;
// };

// if (!globalCrypto.crypto) {
//   Object.defineProperty(globalCrypto, 'crypto', {
//     value: webcrypto,
//     configurable: true,
//   });
// }

import { KG_PLANNING_PROMPT, KG_SYSTEM_PROMPT } from './prompts';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  convertToModelMessages,
  createProviderRegistry,
  ModelMessage,
  ProviderRegistryProvider,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai';

import { z } from 'zod';

import {
  PromptDto,
  DEFAULT_MODEL,
} from './model.constants';

import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from '@ai-sdk/openai-compatible';

import { tavily } from '@tavily/core';

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class LangGraphService {

  //basic configuration 
  private modelRegistry: ProviderRegistryProvider<
    { nvidia: OpenAICompatibleProvider },
    ':'
  >;

  private tavilyClient:
    ReturnType<typeof tavily> | null = null;

  constructor(
    private configService: ConfigService,
  ) {
    const nvidiaApiKey =
      this.configService.get<string>(
        'NVIDIA_API_KEY',
      );

    if (!nvidiaApiKey) {
      throw new Error(
        'NVIDIA_API_KEY is not configured',
      );
    }

    const tavilyApiKey =
      this.configService.get<string>(
        'TAVILY_API_KEY',
      );

    if (tavilyApiKey) {
      this.tavilyClient = tavily({
        apiKey: tavilyApiKey,
      });
    }

    this.modelRegistry =
      createProviderRegistry({
        nvidia:
          createOpenAICompatible({
            name: 'nvidia',

            apiKey: nvidiaApiKey,

            baseURL:
              'https://integrate.api.nvidia.com/v1',
          }),
      });
  }

  //prompts

  private readonly SYSTEM_PROMPT = `
Answer biomedical questions precisely.

Rules:
- Return concise responses.
- Focus on genes, pathways, interactions.
- Small explanations unless explicitly requested.
`;

private readonly KG_SYSTEM_PROMPT = KG_SYSTEM_PROMPT;
private readonly KG_PLANNING_PROMPT =KG_PLANNING_PROMPT;

//helper functions

  private toProviderModelName(
    modelId: `nvidia:${string}`,
  ): string {
    const [provider, model] =
      modelId.split(':');

    if (provider === 'nvidia' && model) {
      return model;
    }

    return DEFAULT_MODEL.split(':')[1];
  }

  private createLangChainModel(
    modelId: `nvidia:${string}`,
  ) {
    return new ChatOpenAI({
      model:
        this.toProviderModelName(
          modelId,
        ),

      apiKey:
        this.configService.get<string>(
          'NVIDIA_API_KEY',
        ),

      configuration: {
        baseURL:
          'https://integrate.api.nvidia.com/v1',
      },

      temperature: 0.1,
    });
  }

  private normalizeMessageContent(
    content: unknown,
  ): string {
    if (typeof content === 'string') {
      return content;
    }

    if (
      content &&
      typeof content === 'object'
    ) {
      return JSON.stringify(content);
    }

    return String(content ?? '');
  }

  private toModelMessages(
    rawMessages: unknown[],
  ): ModelMessage[] {
    const messages: ModelMessage[] = [];

    for (const rawMessage of rawMessages) {
      if (
        !rawMessage ||
        typeof rawMessage !== 'object'
      ) {
        continue;
      }

      const message = rawMessage as {
        role?: string;
        content?: unknown;
        text?: unknown;
        parts?: Array<{
          type?: string;
          text?: string;
        }>;
      };

      const role = message.role;

      if (
        role !== 'system' &&
        role !== 'assistant' &&
        role !== 'user'
      ) {
        continue;
      }

      const partText = message.parts
        ?.map((part) => part.text)
        .filter((part): part is string =>
          typeof part === 'string' && part.length > 0,
        )
        .join('');

      const content = this.normalizeMessageContent(
        message.content ??
          message.text ??
          partText ??
          '',
      );

      messages.push({
        role,
        content,
      });
    }

    return messages;
  }

  //generating response

  generateResponseStream(
    promptDto: PromptDto,
  ) {
    const request =
      promptDto as PromptDto & {
        model?: string;
        messages?: UIMessage[];
      };

    const model =
      request.model || DEFAULT_MODEL;

    // Build system prompt with network context if available
    let systemPrompt = this.SYSTEM_PROMPT;
    if (request.diseaseName || request.networkStatistics) {
      const contextLines: string[] = [];
      
      if (request.diseaseName) {
        contextLines.push(`Current disease context: ${request.diseaseName}`);
      }
      
      if (request.networkStatistics) {
        const stats = request.networkStatistics;
        contextLines.push('Network statistics:');
        if (stats.totalNodes) contextLines.push(`  - Total nodes: ${stats.totalNodes}`);
        if (stats.totalEdges) contextLines.push(`  - Total edges: ${stats.totalEdges}`);
        if (stats.avgDegree) contextLines.push(`  - Average degree: ${stats.avgDegree.toFixed(2)}`);
        if (stats.density) contextLines.push(`  - Network density: ${stats.density.toFixed(4)}`);
      }
      
      if (contextLines.length > 0) {
        systemPrompt += `\n\nNetwork Context:\n${contextLines.join('\n')}`;
      }
    }

    const messages: ModelMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },

      ...convertToModelMessages(
        (request.messages ?? []) as UIMessage[],
      ),
    ];

    return streamText({
      model:
        this.modelRegistry.languageModel(
          model,
        ),

      messages,

      temperature: 0,

      topP: 0.7,

      maxOutputTokens: 4096,

      experimental_telemetry: {
        isEnabled: true,
        functionId:
          'llm-generate-response',
      },
    });
  }

  private toLangGraphMessages(
    promptDto: PromptDto,
  ): BaseMessage[] {
    const request =
      promptDto as PromptDto & {
        messages?: UIMessage[];
      };

    const messages: BaseMessage[] = [];

    for (const message of this.toModelMessages(
      request.messages ?? [],
    )) {
      const content = this.normalizeMessageContent(
        message.content,
      );

      if (message.role === 'system') {
        messages.push(
          new SystemMessage(content),
        );

        continue;
      }

      if (
        message.role === 'assistant'
      ) {
        messages.push(
          new AIMessage(content),
        );

        continue;
      }

      if (message.role === 'user') {
        messages.push(
          new HumanMessage(content),
        );
      }
    }

    // if (!messages.length) {
    //   return [
    //     new HumanMessage(
    //       'Analyze the current graph context.',
    //     ),
    //   ];
    // }

    return messages;
  }

  private formatSelectedNodeContext(
    promptDto: PromptDto,
  ): string {
    const request =
      promptDto as PromptDto & {
        selectedNodeContext?: Array<{
          id: string;
          label: string;
        }>;
      };

    if (
      !request.selectedNodeContext
        ?.length
    ) {
      return '';
    }

    

    const nodes =
      request.selectedNodeContext
        .map(
          (n) =>
            `- ${n.label} (ID: ${n.id})`,
        )
        .join('\n');

    return `
CURRENT CONTEXT - SELECTED NODES:

${nodes}
`;
  }

  private normalizeResponse(
    response: unknown,
  ): string {
    if (typeof response === 'string') {
      return response;
    }

    if (
      response &&
      typeof response === 'object'
    ) {
      const r = response as {
        content?: unknown;
      };

      if (
        typeof r.content ===
        'string'
      ) {
        return r.content;
      }
    }

    return 'Plan unavailable.';
  }

  public async generateKGPlan(
    promptDto: PromptDto,
  ): Promise<string> {
    const request =
      promptDto as PromptDto & {
        model?: string;
      };

    const modelId =
      (request.model ||
        DEFAULT_MODEL) as `nvidia:${string}`;

    const model =
      this.createLangChainModel(
        modelId,
      );

    // Build LangGraph/Base messages from the incoming PromptDto.
    // If the frontend sent a plain `text` field (single user query) include
    // it explicitly as a `HumanMessage` so the planning prompt receives
    // the user's current query. If no messages were provided, the
    // `toLangGraphMessages` helper falls back to a default HumanMessage
    // with the text 'Analyze the current graph context.' (that's the
    // prebuilt content you observed).
    const incomingMessages = this.toLangGraphMessages(promptDto);

    const userText = (promptDto as any).text as string | undefined;
    console.log("Incoming user text:", userText);
    const messages = userText
      ? [new HumanMessage(userText), ...incomingMessages]
      : incomingMessages;

    try {

      let array = [
        new SystemMessage(`
        ${this.KG_PLANNING_PROMPT}

        ${this.formatSelectedNodeContext(
          promptDto,
        )}
         `),

        ...messages,
      ];

      console.log(array);
      const response =
        await model.invoke([
          new SystemMessage(`
      ${this.KG_PLANNING_PROMPT}

       ${this.formatSelectedNodeContext(
            promptDto,
          )}
         
        the user current input is ${userText} answer based on that and the KG_PLANNING_PROMPT guidelines.

            `),

          ...messages,
        ]);

      const plan =
        this.normalizeResponse(
          response.content,
        );

      console.log(
        'Generated KG Plan:',
        plan,
      );

      return plan;
    } catch (error) {
      console.error(
        'KG planning failed:',
        error,
      );

      return `
1. Inspect graph state
2. Run graph tools
3. Validate findings
4. Synthesize response
`;
    }
  }

  public async generateKGChatStream(
    promptDto: PromptDto,
  ) {
    const plan =
      await this.generateKGPlan(
        promptDto,
      );

    return this.generateKGChatStreamWithPlan(
      promptDto,
      plan,
    );
  }

  public generateKGChatStreamWithPlan(
    promptDto: PromptDto,
    plan: string,
  ) {
    const request =
      promptDto as PromptDto & {
        model?: string;
        messages?: UIMessage[];
      };

    const modelId =
      (request.model ||
        DEFAULT_MODEL) as `nvidia:${string}`;

    const tools =
      this.generateKGTools();

    const systemPrompt = `
${this.KG_SYSTEM_PROMPT}

${this.formatSelectedNodeContext(
      promptDto,
    )}

Approved Execution Plan:

${plan}

Start every response with the execution plan.
`;
    console.log("System Prompt:", systemPrompt);
    const messages: ModelMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },

      ...convertToModelMessages(
        (request.messages ?? []) as UIMessage[],
      ),
    ];

    return streamText({
      model:
        this.modelRegistry.languageModel(
          modelId,
        ),

      messages,

      tools,

      stopWhen: stepCountIs(5),

      temperature: 0.1,

      topP: 0.9,

      maxOutputTokens: 4096,

      experimental_telemetry: {
        isEnabled: true,

        functionId:
          'kg-chat-tool-calling',
      },
    });
  }

  public generateKGTools() {
    const kgTools: Record<
      string,
      any
    > = {};

    if (this.tavilyClient) {
      kgTools.searchBiomedicalContext =
        tool({
          description:
            'Search biomedical literature.',

          inputSchema: z.object({
            query: z.string(),

            includeAnswer:
              z.string()
                .optional()
                .default('true'),

            maxResults:
              z.string()
                .optional()
                .default('5'),
          }),

          execute: async ({
            query,
            includeAnswer,
            maxResults,
          }) => {
            try {
              const res =
                await this.tavilyClient!.search(
                  query,
                  {
                    searchDepth:
                      'advanced',

                    topic: 'general',

                    includeAnswer:
                      includeAnswer ===
                      'true',

                    maxResults:
                      Number(
                        maxResults,
                      ),

                    includeDomains: [
                      'pubmed.ncbi.nlm.nih.gov',
                      'www.ncbi.nlm.nih.gov',
                      'www.uniprot.org',
                    ],
                  },
                );

              return {
                answer:
                  res.answer,

                query:
                  res.query,

                results:
                  res.results.map(
                    (r: any) => ({
                      title:
                        r.title,

                      url: r.url,

                      content:
                        r.content,

                      score:
                        r.score,
                    }),
                  ),
              };
            } catch (e) {
              return {
                error:
                  e instanceof Error
                    ? e.message
                    : 'Search failed',
              };
            }
          },
        });
    }

    kgTools.searchNodes = tool({
      description:
        'Search nodes by label.',

      inputSchema: z.object({
        query: z.string(),

        nodeType:
          z.string().optional(),

        limit:
          z.string()
            .optional()
            .default('50'),
      }),
    });

    kgTools.findSimplePaths = tool({
      description:
        'Find paths between nodes.',

      inputSchema: z.object({
        sourceLabelOrId:
          z.string(),

        targetLabelOrId:
          z.string(),

        maxLength:
          z.string()
            .optional()
            .default('5'),

        maxPaths:
          z.string()
            .optional()
            .default('100'),
      }),
    });

    kgTools.highlightNodes = tool({
      description:
        'Highlight graph nodes.',

      inputSchema: z.object({
        nodeLabelsOrIds:
          z.array(z.string()),

        color:
          z.string().optional(),
      }),
    });

    kgTools.computeCentrality =
      tool({
        description:
          'Compute graph centrality.',

        inputSchema: z.object({
          metric: z.enum([
            'degree',
            'betweenness',
            'closeness',
            'eigenvector',
          ]),
        }),
      });

    kgTools.computeNetworkStatistics =
      tool({
        description:
          'Compute network statistics.',

        inputSchema: z.object({}),
      });

    return kgTools;
  }
}
