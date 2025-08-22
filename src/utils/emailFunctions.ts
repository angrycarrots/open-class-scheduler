import { emailService, renderTemplate, type EmailData } from './email';
import waiverTemplate from '../templates/waiver-agreement.html?raw';
import registrationTemplate from '../templates/registration-confirmation.html?raw';
import cancellationTemplate from '../templates/class-cancellation.html?raw';

// Send waiver agreement email
export async function sendWaiverEmail(
  userEmail: string,
  userName: string,
  waiverContent: string
): Promise<void> {
  const emailData: EmailData = {
    userEmail,
    userName: userName || 'Valued Customer',
    waiverContent,
    agreementDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  const htmlBody = renderTemplate(waiverTemplate, emailData);
  const subject = 'Waiver Agreement Confirmation - Yoga Class Scheduler';

  await emailService.sendEmail(userEmail, subject, htmlBody);
}

// Send class registration confirmation email
export async function sendRegistrationEmail(
  userEmail: string,
  userName: string,
  className: string,
  classDate: string,
  classTime: string,
  instructor: string,
  paymentAmount: number,
  classLocation: string = 'Main Studio'
): Promise<void> {
  const emailData: EmailData = {
    userEmail,
    userName: userName || 'Valued Customer',
    className,
    classDate,
    classTime,
    instructor,
    paymentAmount,
    classLocation,
  };

  const htmlBody = renderTemplate(registrationTemplate, emailData);
  const subject = `Registration Confirmed - ${className}`;

  await emailService.sendEmail(userEmail, subject, htmlBody);
}

// Send class cancellation notification email
export async function sendCancellationEmail(
  userEmail: string,
  userName: string,
  className: string,
  classDate: string,
  classTime: string,
  instructor: string,
  paymentAmount: number
): Promise<void> {
  const emailData: EmailData = {
    userEmail,
    userName: userName || 'Valued Customer',
    className,
    classDate,
    classTime,
    instructor,
    paymentAmount,
  };

  const htmlBody = renderTemplate(cancellationTemplate, emailData);
  const subject = `Class Cancelled - ${className}`;

  await emailService.sendEmail(userEmail, subject, htmlBody);
}

// Send cancellation emails to all registrants of a class
export async function sendCancellationToAllRegistrants(
  registrations: Array<{
    user_id: string;
    payment_amount: number;
    profiles?: {
      full_name?: string;
      email?: string;
    };
  }>,
  className: string,
  classDate: string,
  classTime: string,
  instructor: string
): Promise<void> {
  const emailPromises = registrations
    .filter(registration => registration.profiles?.email)
    .map(registration =>
      sendCancellationEmail(
        registration.profiles!.email!,
        registration.profiles?.full_name || 'Valued Customer',
        className,
        classDate,
        classTime,
        instructor,
        registration.payment_amount
      )
    );

  await Promise.allSettled(emailPromises);
}
