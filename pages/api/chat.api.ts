import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"
import {getTiktokenEncoding, numberOfTokensInConversation, prepareMessagesToSend} from "@/utils/server/tiktoken"
import {ChatBody, Message} from "@/types/chat"
import {OpenAIModels} from "@/types/openai"

export const config = {
  runtime: "edge"
}

function errorResponse(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  })
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const encoding = await getTiktokenEncoding()
    const {messages, apiKey, modelId, prompt, temperature} = (await req.json()) as ChatBody
    const {tokenLimit} = OpenAIModels[modelId]

    const promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    const messagesToSend = await prepareMessagesToSend(
      tokenLimit,
      OPENAI_API_MAX_TOKENS,
      promptToSend,
      messages,
      modelId
    )
    const temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    // Log prompt statistics (not just debugging, also for checking use of service).
    const allMessages: Message[] = [{role: "system", content: promptToSend}, ...(messagesToSend ?? [])]
    const message = allMessages[allMessages.length - 1]
    console.info(`sendRequest: {\
message:'${trimForPrivacy(message.content)}', \
totalNumberOfTokens:${numberOfTokensInConversation(encoding, allMessages, modelId)}, \
modelId:'${modelId}', \
messageLengthInChars:${message.content.length}, \
totalNumberOfMessages:${allMessages.length}, \
temperature:${temperature}}`)

    return await ChatCompletionStream(modelId, promptToSend, temperatureToUse, apiKey, messagesToSend)
  } catch (error) {
    if (error instanceof OpenAIRateLimited) {
      return errorResponse(
        {
          errorType: "rate_limit",
          retryAfter: error.retryAfterSeconds
        },
        429
      )
    }

    if (error instanceof OpenAIAuthError) {
      return errorResponse(
        {
          errorType: "openai_auth_error"
        },
        401
      )
    }

    if (error instanceof OpenAILimitExceeded) {
      return errorResponse(
        {
          errorType: "context_length_exceeded",
          limit: error.limit,
          requested: error.requested
        },
        400
      )
    }

    if (error instanceof GenericOpenAIError) {
      return errorResponse(
        {
          errorType: "generic_openai_error",
          message: error.message
        },
        400
      )
    }

    if (error instanceof OpenAIError) {
      return errorResponse(
        {
          errorType: "openai_error",
          message: error.message
        },
        500
      )
    }

    console.error("Unexpected error", error)
    if (error instanceof Error) {
      return errorResponse(
        {
          errorType: "unexpected_error",
          message: error.message
        },
        500
      )
    }

    return errorResponse(
      {
        errorType: "unexpected_error",
        message: "Unknown error"
      },
      500
    )
  }
}

export default handler
