// SMS notification utility functions
// This is a placeholder implementation - you'll need to integrate with a real SMS service

export interface SMSConfig {
  apiKey: string;
  phoneNumber: string;
  service: 'twilio' | 'aws-sns' | 'custom';
}

export const sendSMS = async (
  to: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: SMSConfig
): Promise<boolean> => {
  try {
    // Placeholder for actual SMS service integration
    // In production, you would integrate with a real SMS service
    // Example with Twilio:
    /*
    const accountSid = config?.apiKey;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: config?.phoneNumber,
      to: to
    });
    */

    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
};

export const sendRegistrationConfirmation = async (
  phone: string,
  className: string,
  date: string,
  time: string
): Promise<boolean> => {
  const message = `Thank you for registering for ${className} on ${date} at ${time}. Your registration has been confirmed. See you there!`;
  
  return sendSMS(phone, message);
};

export const sendNewUserConfirmation = async (
  phone: string,
  email: string
): Promise<boolean> => {
  const message = `Welcome to our yoga community! Your account has been created successfully. You can now register for classes using ${email}.`;
  
  return sendSMS(phone, message);
};

export const sendClassCancellation = async (
  phone: string,
  className: string,
  date: string,
  time: string
): Promise<boolean> => {
  const message = `Unfortunately, ${className} on ${date} at ${time} has been cancelled. We apologize for any inconvenience.`;
  
  return sendSMS(phone, message);
};
