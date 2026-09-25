import 'server-only'

import nodemailer, { SentMessageInfo } from 'nodemailer'
import { env } from '~/env'
import { AppError, AppErrorCode } from './errors'

/**
 * Configure the email transporter using environment variables.
 * Uses nodemailer for sending emails via SMTP.
 */
const transporter = nodemailer.createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  secure: env.EMAIL_SERVER_PORT === 465, // Use secure for port 465, false for other ports
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD
  }
})

/**
 * Interface for the email payload
 */
interface SendEmailParams {
  to: string
  subject: string
  text?: string
  html?: string
}

/**
 * Sends an email using the configured transporter.
 *
 * @param {SendEmailParams} params - The email parameters.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject of the email.
 * @param {string} [params.text] - The plain text content of the email.
 * @param {string} [params.html] - The HTML content of the email (optional).
 * @returns {Promise<any>} Resolves when the email is sent successfully.
 * @throws {Error} If sending the email fails.
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: SendEmailParams): Promise<SentMessageInfo> => {
  'use step'

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    })

    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw new AppError(
      AppErrorCode.INTERNAL,
      'The email was not sent. Try again.'
    )
  }
}
