import { Router, Request, Response } from 'express';
import logger from '../config/logger';
import whatsappService from '../services/whatsapp';
import adkBridge from '../services/adk-bridge';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Conversation, MessageRole, Message } from '../entities/Conversation';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'abuja_realty_verify_token';

interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'location' | 'document';
  text?: { body: string };
  image?: { id: string; mime_type: string };
  location?: { latitude: number; longitude: number };
  voice?: { id: string; mime_type: string };
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: WhatsAppWebhookMessage[];
    };
  }>;
}

// Webhook verification (GET)
router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    logger.error('WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook message handler (POST)
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Quick response to WhatsApp
    res.sendStatus(200);

    if (body.object !== 'whatsapp_business_account') {
      logger.warn('Invalid webhook object type', { object: body.object });
      return;
    }

    const entry: WhatsAppWebhookEntry = body.entry?.[0];
    if (!entry) {
      logger.warn('No entry in webhook payload');
      return;
    }

    const changes = entry.changes?.[0];
    if (!changes) {
      logger.warn('No changes in webhook entry');
      return;
    }

    const value = changes.value;
    const messages = value.messages;

    if (!messages || messages.length === 0) {
      logger.info('No messages in webhook payload (probably status update)');
      return;
    }

    const message = messages[0];
    const from = message.from;

    logger.info('Received WhatsApp message', {
      from,
      type: message.type,
      messageId: message.id,
    });

    // Mark message as read
    await whatsappService.markMessageAsRead(message.id);

    // Get or create user
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({ where: { phone_number: from } });

    if (!user) {
      const contact = value.contacts?.[0];
      user = userRepository.create({
        phone_number: from,
        whatsapp_id: contact?.wa_id,
        name: contact?.profile?.name,
      });
      await userRepository.save(user);
      logger.info('Created new user', { userId: user.id, phone: from });
    }

    // Extract message content
    let messageContent = '';
    let messageMetadata: any = {};

    switch (message.type) {
      case 'text':
        messageContent = message.text?.body || '';
        break;
      case 'location':
        messageContent = 'User shared location';
        messageMetadata = {
          location: message.location,
        };
        break;
      case 'image':
        messageContent = 'User shared an image';
        messageMetadata = {
          image_id: message.image?.id,
        };
        break;
      default:
        messageContent = `User sent a ${message.type} message`;
    }

    // Save conversation
    const conversationRepository = AppDataSource.getRepository(Conversation);
    let conversation = await conversationRepository.findOne({
      where: { user_id: user.id, active: true },
      order: { created_at: 'DESC' },
    });

    if (!conversation) {
      conversation = conversationRepository.create({
        user_id: user.id,
        messages: [],
        active: true,
      });
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: uuidv4(),
      role: MessageRole.USER,
      content: messageContent,
      timestamp: new Date(),
      metadata: {
        whatsapp_message_id: message.id,
        ...messageMetadata,
      },
    };

    conversation.messages = [...conversation.messages, userMessage];
    await conversationRepository.save(conversation);

    // Query ADK agent
    try {
      const agentResponse = await adkBridge.queryAgent({
        user_id: user.id,
        session_id: conversation.agent_session_id || undefined,
        message: messageContent,
        message_type: message.type,
        metadata: messageMetadata,
      });

      // Update conversation with agent session ID
      if (agentResponse.session_id && !conversation.agent_session_id) {
        conversation.agent_session_id = agentResponse.session_id;
      }

      // Add agent response to conversation
      const agentMessage: Message = {
        id: uuidv4(),
        role: MessageRole.AGENT,
        content: agentResponse.response,
        timestamp: new Date(),
        metadata: {
          agent_name: agentResponse.agent_name,
          requires_confirmation: agentResponse.requires_confirmation,
        },
      };

      conversation.messages = [...conversation.messages, agentMessage];
      await conversationRepository.save(conversation);

      // Send WhatsApp response
      await whatsappService.sendTextMessage(from, agentResponse.response);

      // Handle suggested actions (e.g., send property images, locations)
      if (agentResponse.suggested_actions) {
        for (const action of agentResponse.suggested_actions) {
          switch (action.type) {
            case 'send_image':
              await whatsappService.sendImageMessage(
                from,
                action.data.url,
                action.data.caption
              );
              break;
            case 'send_location':
              await whatsappService.sendLocationMessage(
                from,
                action.data.latitude,
                action.data.longitude,
                action.data.name,
                action.data.address
              );
              break;
          }
        }
      }

      logger.info('WhatsApp message processed successfully', {
        userId: user.id,
        messageId: message.id,
      });
    } catch (error: any) {
      logger.error('Failed to process message with ADK agent', {
        error: error.message,
        userId: user.id,
      });

      // Send error message to user
      await whatsappService.sendTextMessage(
        from,
        'Sorry, I encountered an error processing your message. Please try again in a moment.'
      );
    }
  } catch (error: any) {
    logger.error('Failed to process WhatsApp webhook', {
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
