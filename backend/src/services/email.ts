import sgMail from '@sendgrid/mail';
import { User, Booking, Task, Lead } from '../types/index.js';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@zeus-ops.com';
const APP_URL = process.env.APP_URL || 'https://app.zeus-ops.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

const defaultRetry: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetry,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= config.maxRetries) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, config.delayMs * attempt));
    return withRetry(fn, config, attempt + 1);
  }
}

export async function sendWelcomeEmail(user: User): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping welcome email');
    return;
  }

  const msg = {
    to: user.email,
    from: FROM_EMAIL,
    subject: 'Welcome to ZEUS OPS',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Welcome to ZEUS OPS, ${user.firstName} ${user.lastName}!</h1>
        <p>Your account has been successfully created. You're now ready to streamline your operations.</p>
        <a href="${APP_URL}/dashboard" 
           style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  font-weight: 600; margin-top: 20px;">
          Go to Dashboard
        </a>
        <p style="color: #666; margin-top: 30px; font-size: 12px;">
          If you didn't create this account, please contact support immediately.
        </p>
      </div>
    `,
  };

  await withRetry(() => sgMail.send(msg));
}

export async function sendBookingConfirmation(
  booking: Booking,
  user: User
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping booking confirmation');
    return;
  }

  const msg = {
    to: user.email,
    from: FROM_EMAIL,
    subject: `Booking Confirmed: ${`${booking.eventType} call`}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Booking Confirmed!</h1>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #fff;">${`${booking.eventType} call`}</h2>
          <p><strong>Date:</strong> ${new Date(booking.scheduledAt).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(booking.scheduledAt).toLocaleTimeString()}</p>
          ${booking.meetingUrl ? `<p><strong>Meeting link:</strong> ${booking.meetingUrl}</p>` : ''}
          ${booking.notes ? `<p><strong>Description:</strong> ${booking.notes}</p>` : ''}
        </div>
        <p>Add to your calendar:</p>
        <a href="${APP_URL}/bookings/${booking.id}/calendar" 
           style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  font-weight: 600;">
          Add to Calendar
        </a>
        <p style="margin-top: 20px;">
          <a href="${APP_URL}/bookings/${booking.id}/cancel" style="color: #ff4444;">
            Need to cancel? Click here
          </a>
        </p>
      </div>
    `,
  };

  await withRetry(() => sgMail.send(msg));
}

export async function sendPasswordReset(
  email: string,
  token: string
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping password reset email');
    return;
  }

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset Your ZEUS OPS Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  font-weight: 600; margin-top: 20px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">
          Or copy and paste this link: <br/>
          <code style="background: #1a1a1a; padding: 8px; border-radius: 4px; 
                       word-break: break-all;">${resetUrl}</code>
        </p>
        <p style="color: #666; margin-top: 30px; font-size: 12px;">
          This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await withRetry(() => sgMail.send(msg));
}

export async function sendTaskAssignment(
  task: Task,
  assignee: User
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping task assignment email');
    return;
  }

  const msg = {
    to: assignee.email,
    from: FROM_EMAIL,
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">You've Been Assigned a Task</h1>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #fff;">${task.title}</h2>
          <p><strong>Priority:</strong> 
            <span style="color: ${task.priority === 'high' ? '#ff4444' : task.priority === 'medium' ? '#ffaa00' : '#00d4ff'};">
              ${task.priority.toUpperCase()}
            </span>
          </p>
          ${task.dueDate ? `<p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
          ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
        </div>
        <a href="${APP_URL}/tasks/${task.id}" 
           style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  font-weight: 600;">
          View Task
        </a>
        <p style="margin-top: 20px;">
          <a href="${APP_URL}/tasks/${task.id}/accept" 
             style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                    padding: 8px 16px; text-decoration: none; border-radius: 4px; 
                    font-weight: 500; margin-right: 10px;">
            Accept
          </a>
          <a href="${APP_URL}/tasks/${task.id}/decline" 
             style="display: inline-block; background: transparent; color: #ff4444; 
                    border: 1px solid #ff4444; padding: 8px 16px; text-decoration: none; 
                    border-radius: 4px; font-weight: 500;">
            Decline
          </a>
        </p>
      </div>
    `,
  };

  await withRetry(() => sgMail.send(msg));
}

export async function sendLeadNotification(
  lead: Lead,
  admin: User
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping lead notification');
    return;
  }

  const msg = {
    to: admin.email,
    from: FROM_EMAIL,
    subject: `New Lead: ${`${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim() || lead.email} - ${lead.company || 'No Company'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">🎯 New Lead Captured!</h1>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #fff;">${`${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim() || lead.email}</h2>
          <p><strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #00d4ff;">${lead.email}</a></p>
          ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          ${lead.source ? `<p><strong>Source:</strong> ${lead.source}</p>` : ''}
          ${lead.notes ? `
            <div style="margin-top: 15px; padding: 15px; background: #0a0a0a; border-radius: 4px;">
              <strong>Message:</strong><br/>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${lead.notes}</p>
            </div>
          ` : ''}
          <p style="margin-top: 15px; font-size: 12px; color: #666;">
            Submitted: ${new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
        <a href="${APP_URL}/leads/${lead.id}" 
           style="display: inline-block; background: #00d4ff; color: #0a0a0a; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  font-weight: 600;">
          View Lead in CRM
        </a>
        <a href="${APP_URL}/leads/${lead.id}/convert" 
           style="display: inline-block; background: transparent; color: #00d4ff; 
                  border: 1px solid #00d4ff; padding: 12px 24px; text-decoration: none; 
                  border-radius: 6px; font-weight: 600; margin-left: 10px;">
          Convert to Client
        </a>
      </div>
    `,
  };

  await withRetry(() => sgMail.send(msg));
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<{ successful: string[]; failed: string[] }> {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid not configured');
  }

  const successful: string[] = [];
  const failed: string[] = [];

  for (const recipient of recipients) {
    try {
      const msg = {
        to: recipient,
        from: FROM_EMAIL,
        subject,
        html,
      };
      await withRetry(() => sgMail.send(msg));
      successful.push(recipient);
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
      failed.push(recipient);
    }
  }

  return { successful, failed };
}
