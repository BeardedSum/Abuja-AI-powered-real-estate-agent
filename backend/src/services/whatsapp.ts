import axios from 'axios';
import FormData from 'form-data';
import logger from '../config/logger';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

export interface WhatsAppTextMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

export interface WhatsAppImageMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'image';
  image: {
    link?: string;
    id?: string;
    caption?: string;
  };
}

export interface WhatsAppLocationMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'location';
  location: {
    latitude: string;
    longitude: string;
    name: string;
    address: string;
  };
}

export interface WhatsAppTemplateMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export class WhatsAppService {
  private baseUrl: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = WHATSAPP_API_URL;
    this.phoneNumberId = PHONE_NUMBER_ID;
    this.accessToken = ACCESS_TOKEN;
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    try {
      const message: WhatsAppTextMessage = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp text message sent', { to, messageId: response.data.messages[0].id });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp text message', {
        error: error.response?.data || error.message,
        to,
      });
      throw error;
    }
  }

  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<any> {
    try {
      const message: WhatsAppImageMessage = {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
          link: imageUrl,
          caption,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp image message sent', { to, messageId: response.data.messages[0].id });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp image message', {
        error: error.response?.data || error.message,
        to,
      });
      throw error;
    }
  }

  async sendLocationMessage(
    to: string,
    latitude: number,
    longitude: number,
    name: string,
    address: string
  ): Promise<any> {
    try {
      const message: WhatsAppLocationMessage = {
        messaging_product: 'whatsapp',
        to,
        type: 'location',
        location: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          name,
          address,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp location message sent', { to, messageId: response.data.messages[0].id });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp location message', {
        error: error.response?.data || error.message,
        to,
      });
      throw error;
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en'): Promise<any> {
    try {
      const message: WhatsAppTemplateMessage = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp template message sent', { to, templateName, messageId: response.data.messages[0].id });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp template message', {
        error: error.response?.data || error.message,
        to,
        templateName,
      });
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to mark message as read', {
        error: error.response?.data || error.message,
        messageId,
      });
      throw error;
    }
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data.url;
    } catch (error: any) {
      logger.error('Failed to get media URL', {
        error: error.response?.data || error.message,
        mediaId,
      });
      throw error;
    }
  }

  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      logger.error('Failed to download media', {
        error: error.message,
        mediaUrl,
      });
      throw error;
    }
  }
}

export default new WhatsAppService();
