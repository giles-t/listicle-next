import { Resend } from 'resend';
import { config } from './config';
import logger from './logger';
import { captureException } from './sentry';
import { ReactElement } from 'react';

const resend = new Resend(config.resend.apiKey);

type EmailPayload = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  from = 'Listicle <no-reply@listicle.app>',
  cc,
  bcc,
  replyTo,
}: EmailPayload) {
  if (!config.resend.apiKey) {
    logger.warn('Resend API key not provided, email sending disabled');
    return { success: false, error: 'Resend API key not provided' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      cc,
      bcc,
      replyTo,
    });

    if (error) {
      logger.error({ error }, 'Failed to send email');
      return { success: false, error };
    }

    logger.info({ emailId: data?.id }, 'Email sent successfully');
    return { success: true, data };
  } catch (error) {
    logger.error({ error }, 'Exception when sending email');
    captureException(error, { context: 'email.send' });
    return { success: false, error };
  }
} 