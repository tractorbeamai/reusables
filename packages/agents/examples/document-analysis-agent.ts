import { z } from "zod";
import { AgentBuilder, MessageManager, createTool } from "../src";
import type { LLMProvider, Message } from "../src";

// Example: Document Analysis Agent (similar to the compliance agent)
// This demonstrates a more complex agent that analyzes documents

interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

interface AnalysisResult {
  decision: "PASS" | "FAIL" | "NEEDS_REVIEW";
  confidence: number;
  reasoning: string;
  annotations: Array<{
    id: string;
    text: string;
    importance: "high" | "medium" | "low";
  }>;
}

// Custom tools for document analysis
const analyzeTextTool = createTool({
  name: "analyze_text",
  description: "Analyze a section of text for specific criteria",
  inputSchema: z.object({
    text: z.string().describe("The text to analyze"),
    criteria: z.array(z.string()).describe("Criteria to check for"),
  }),
  handler: async (input) => {
    // Mock analysis - in real implementation, this might use NLP
    const scores = input.criteria.map((criterion) => ({
      criterion,
      score: Math.random(), // Mock score
      found: Math.random() > 0.5,
    }));

    return {
      text: input.text.substring(0, 100) + "...",
      analysis: scores,
      overallScore: scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
    };
  },
});

const compareDocumentsTool = createTool({
  name: "compare_documents",
  description: "Compare two documents for consistency",
  inputSchema: z.object({
    doc1Id: z.string(),
    doc2Id: z.string(),
    aspects: z.array(z.string()).describe("Aspects to compare"),
  }),
  handler: async (input) => {
    // Mock comparison
    return {
      similarity: 0.85,
      differences: [
        { aspect: "formatting", severity: "minor" },
        { aspect: "data_values", severity: "major" },
      ],
      recommendation: "Review major differences in data values",
    };
  },
});

const annotateDocumentTool = createTool({
  name: "annotate_document",
  description: "Add annotations to specific parts of a document",
  inputSchema: z.object({
    documentId: z.string(),
    annotations: z.array(
      z.object({
        text: z.string().describe("Text to annotate"),
        type: z.enum(["issue", "confirmation", "note"]),
        importance: z.enum(["high", "medium", "low"]),
        comment: z.string().optional(),
      })
    ),
  }),
  handler: async (input) => {
    // Store annotations (mock)
    return {
      documentId: input.documentId,
      annotationCount: input.annotations.length,
      annotationIds: input.annotations.map((_, i) => `ann_${Date.now()}_${i}`),
    };
  },
});

const makeDecisionTool = createTool({
  name: "make_decision",
  description: "Make a final decision about the document analysis",
  inputSchema: z.object({
    decision: z.enum(["PASS", "FAIL", "NEEDS_REVIEW"]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    keyFindings: z.array(z.string()),
  }),
  handler: async (input) => {
    return {
      ...input,
      timestamp: new Date().toISOString(),
      reviewRequired:
        input.decision === "NEEDS_REVIEW" || input.confidence < 0.7,
    };
  },
});

// Create a mock LLM provider that simulates document analysis
function createDocumentAnalysisLLM(documents: Document[]): LLMProvider {
  let step = 0;

  return {
    name: "document-analysis-llm",
    async generateResponse(request): Promise<{ message: Message }> {
      step++;

      switch (step) {
        case 1:
          // First, think about the task
          return {
            message: {
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: "think_1",
                  name: "think",
                  input: {
                    thought:
                      "I need to analyze these documents for compliance. Let me start by examining the content and identifying key sections.",
                  },
                },
              ],
            },
          };

        case 2:
          // Analyze the first document
          return {
            message: {
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: "analyze_1",
                  name: "analyze_text",
                  input: {
                    text: documents[0].content,
                    criteria: [
                      "accuracy",
                      "completeness",
                      "consistency",
                      "formatting",
                    ],
                  },
                },
              ],
            },
          };

        case 3:
          // Compare documents if multiple
          if (documents.length > 1) {
            return {
              message: {
                role: "assistant",
                content: [
                  {
                    type: "tool_use",
                    id: "compare_1",
                    name: "compare_documents",
                    input: {
                      doc1Id: documents[0].id,
                      doc2Id: documents[1].id,
                      aspects: [
                        "data_consistency",
                        "format_alignment",
                        "completeness",
                      ],
                    },
                  },
                ],
              },
            };
          }
        // fallthrough

        case 4:
          // Add annotations
          return {
            message: {
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: "annotate_1",
                  name: "annotate_document",
                  input: {
                    documentId: documents[0].id,
                    annotations: [
                      {
                        text: "Revenue figures in Q3",
                        type: "confirmation",
                        importance: "high",
                        comment: "Matches expected values",
                      },
                      {
                        text: "Missing signature",
                        type: "issue",
                        importance: "high",
                        comment: "Document requires authorized signature",
                      },
                    ],
                  },
                },
              ],
            },
          };

        case 5:
          // Make final decision
          return {
            message: {
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: "decide_1",
                  name: "make_decision",
                  input: {
                    decision: "NEEDS_REVIEW",
                    confidence: 0.75,
                    reasoning:
                      "While most compliance criteria are met, the missing signature requires human review before final approval.",
                    keyFindings: [
                      "Financial data is accurate and consistent",
                      "Document formatting meets standards",
                      "Missing required signature on page 3",
                      "All other compliance checks passed",
                    ],
                  },
                },
              ],
            },
          };

        default:
          // Final message
          return {
            message: {
              role: "assistant",
              content:
                "Document analysis complete. The document needs review due to a missing signature, but all other compliance criteria have been met.",
            },
          };
      }
    },
  };
}

// Main example function
async function runDocumentAnalysisExample() {
  // Sample documents
  const documents: Document[] = [
    {
      id: "doc_001",
      content:
        "Quarterly Financial Report Q3 2024\n\nRevenue: $10.5M\nExpenses: $7.2M\nNet Profit: $3.3M\n\nThis report has been reviewed by the finance team.",
      metadata: { type: "financial_report", quarter: "Q3", year: 2024 },
    },
    {
      id: "doc_002",
      content:
        "Quarterly Financial Summary Q3 2024\n\nTotal Revenue: $10.5M\nTotal Expenses: $7.2M\nNet Income: $3.3M\n\nPrepared by: Finance Department",
      metadata: { type: "financial_summary", quarter: "Q3", year: 2024 },
    },
  ];

  // Build the agent
  const agent = AgentBuilder.create()
    .name("DocumentComplianceAgent")
    .description("Analyzes documents for compliance and consistency")
    .systemPrompt(
      `You are a document compliance analyst. Your job is to:
1. Analyze documents for accuracy, completeness, and compliance
2. Compare multiple documents for consistency
3. Identify any issues or discrepancies
4. Provide clear annotations and explanations
5. Make a final decision with confidence level`
    )
    .llmProvider(createDocumentAnalysisLLM(documents))
    .addCommonTools() // think, calculate, memory, conclude
    .addTools([
      analyzeTextTool as any,
      compareDocumentsTool as any,
      annotateDocumentTool as any,
      makeDecisionTool as any,
    ])
    .maxIterations(20)
    .onMessage((message) => {
      console.log("\n" + "=".repeat(50));
      console.log(MessageManager.formatForDisplay(message));
    })
    .onToolCall(async (toolName, input, result) => {
      console.log(`\n🔧 Tool: ${toolName}`);
      console.log("Input:", JSON.stringify(input, null, 2));
      console.log("Result:", JSON.stringify(result, null, 2));
    })
    .onError((error) => {
      console.error("❌ Error:", error.message);
    })
    .build();

  console.log("🚀 Starting document analysis...\n");

  // Execute the agent
  const result = await agent.execute({
    initialMessages: [
      MessageManager.createUserMessage(
        `Please analyze these documents for compliance:\n\n` +
          documents
            .map((d) => `Document ${d.id}:\n${d.content}`)
            .join("\n\n---\n\n")
      ),
    ],
    metadata: {
      analysisType: "quarterly_financial_compliance",
      requiredCriteria: ["accuracy", "completeness", "authorization"],
    },
  });

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Analysis Summary:");
  console.log(`Total iterations: ${result.iterations}`);
  console.log(`Total messages: ${result.messages.length}`);

  // Extract the final decision
  const finalDecision = result.messages.reverse().find((m) => {
    if (m.role !== "assistant") return false;
    const contents = Array.isArray(m.content) ? m.content : [m.content];
    return contents.some(
      (c) =>
        typeof c === "object" &&
        c.type === "tool_use" &&
        c.name === "make_decision"
    );
  });

  if (finalDecision) {
    console.log("\n✅ Final Decision Found!");
  }

  return result;
}

// Run the example
if (require.main === module) {
  runDocumentAnalysisExample()
    .then(() => console.log("\n✨ Example completed successfully!"))
    .catch((error) => console.error("\n❌ Example failed:", error));
}
