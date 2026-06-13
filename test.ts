import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ToolUniverseMcpService } from './llm/tooluniverse-mcp.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const toolService = app.get(ToolUniverseMcpService);

    const tools = await toolService.getTools();

    console.log(
      'Available tools:',
      Object.keys(tools),
    );

    const pubmed =
      tools['PubMed_search_articles'];

    console.log(
      '\nPubMed Schema:',
    );

    console.dir(
      pubmed.inputSchema,
      { depth: null },
    );

    console.log(
      '\nExecuting PubMed...',
    );

    const result =
      await pubmed.execute({
        query:
          'graph neural networks drug repurposing',
      });

    console.log(
      '\nSUCCESS:',
    );

    console.dir(
      result,
      { depth: null },
    );
  } catch (error) {
    console.error(
      '\nFAILED:',
    );

    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();