// Email Service - Provider-agnostic email sending
export interface EmailService {
  sendEmail(to: string, subject: string, htmlBody: string, textBody?: string): Promise<void>;
}

export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
}

export interface EmailData {
  userName?: string;
  userEmail?: string;
  className?: string;
  classDate?: string;
  classTime?: string;
  instructor?: string;
  waiverContent?: string;
  paymentAmount?: number;
  [key: string]: any; // Allow additional dynamic data
}

// Local development email service using Inbucket
class InbucketEmailService implements EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_INBUCKET_URL || 'http://127.0.0.1:9000';
  }

  async sendEmail(to: string, subject: string, htmlBody: string, textBody?: string): Promise<void> {
    try {
      // For development, just log the email details
      console.log('📧 Email Service (Development Mode)');
      console.log(`📧 To: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 HTML Body Length: ${htmlBody.length} characters`);
      if (textBody) {
        console.log(`📧 Text Body Length: ${textBody.length} characters`);
      }
      console.log('📧 Email would be sent in production');
      console.log('📧 Check browser console for email content');
      
      // Log a preview of the email content
      console.log('📧 Email Preview:');
      console.log('--- HTML Content ---');
      console.log(htmlBody.substring(0, 500) + (htmlBody.length > 500 ? '...' : ''));
      console.log('--- End Preview ---');
      
    } catch (error) {
      console.error('Email service error:', error);
      // Don't throw error to avoid blocking user operations
    }
  }

  private stripHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

// Production email service (placeholder for future implementation)
class ProductionEmailService implements EmailService {
  async sendEmail(to: string, subject: string, htmlBody: string, textBody?: string): Promise<void> {
    // TODO: Implement production email provider (SendGrid, Resend, etc.)
    console.log(`📧 [PRODUCTION] Email would be sent to ${to}: ${subject}`);
    console.log('HTML Body:', htmlBody);
    if (textBody) {
      console.log('Text Body:', textBody);
    }
  }
}

// Email service factory
export function createEmailService(): EmailService {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'inbucket';
  
  switch (provider) {
    case 'inbucket':
      return new InbucketEmailService();
    case 'production':
      return new ProductionEmailService();
    default:
      console.warn(`Unknown email provider: ${provider}, using Inbucket`);
      return new InbucketEmailService();
  }
}

// Template rendering utility
export function renderTemplate(template: string, data: EmailData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Global email service instance
export const emailService = createEmailService();
