import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createMCPClient, type MCPClient } from '@ai-sdk/mcp';

const TOOLUNIVERSE_TOOL_NAMES = [
  'PubMed_search_articles',
  'UniProt_get_entry_by_accession',
  'search_clinical_trials',
  'FAERS_count_death_related_by_drug',
  'DGIdb_get_drug_gene_interactions',
  'GDC_get_mutation_frequency',
  'ChEMBL_get_molecule',
  'get_HPO_ID_by_phenotype',
  'OpenTargets_get_associated_targets_by_disease_efoId',
  'MedlinePlus_get_genetics_condition_by_name',
] as const;

@Injectable()
export class ToolUniverseMcpService implements OnModuleDestroy {
  private readonly logger = new Logger(ToolUniverseMcpService.name);
  private clientPromise: Promise<MCPClient> | null = null;
  private toolsCache: Record<string, any> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private get serverUrl(): string {
    return this.configService.get<string>('TOOLUNIVERSE_MCP_URL', 'http://localhost:8000/mcp');
  }

  private async getClient(): Promise<MCPClient> {
    if (!this.clientPromise) {
      this.clientPromise = createMCPClient({
        transport: {
          type: 'http',
          url: this.serverUrl,
        },
        clientName: 'tbep-kg-tooluniverse',
      }).catch((error) => {
        this.clientPromise = null;
        throw error;
      });
    }

    return this.clientPromise;
  }

  public async getTools(): Promise<Record<string, any>> {
    if (this.toolsCache) {
      return this.toolsCache;
    }

    try {
      const client = await this.getClient();
      const allTools = await client.tools();
      const selectedTools = TOOLUNIVERSE_TOOL_NAMES.reduce<Record<string, any>>((accumulator, toolName) => {
        const tool = allTools[toolName];

        if (tool) {
          accumulator[toolName] = tool;
        }

        return accumulator;
      }, {});

      const missingTools = TOOLUNIVERSE_TOOL_NAMES.filter((toolName) => !allTools[toolName]);

      if (missingTools.length > 0) {
        this.logger.warn(`ToolUniverse MCP server did not expose: ${missingTools.join(', ')}`);
      }

      this.toolsCache = selectedTools;
      return selectedTools;
    } catch (error) {
      this.logger.warn(
        `ToolUniverse MCP bridge unavailable at ${this.serverUrl}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {};
    }
  }

  async onModuleDestroy() {
    if (!this.clientPromise) {
      return;
    }

    try {
      const client = await this.clientPromise;
      await client.close();
    } catch {
      // Ignore shutdown errors.
    }
  }
}