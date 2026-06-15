import { render, toPlainText } from '@react-email/render'
import InvitationEmail, { InvitationEmailProps } from '~/emails/invitation'
import MagicLinkEmail, { MagicLinkEmailProps } from '~/emails/magic-link'
import WelcomeEmail, { WelcomeEmailProps } from '~/emails/welcome'
import { sendEmail } from './nodemailer'

/**
 * Mapping of template types to their corresponding props
 */
type EmailTemplateMap = {
  welcome: WelcomeEmailProps
  magicLink: MagicLinkEmailProps
  invitation: InvitationEmailProps
}

type EmailTemplateType = keyof EmailTemplateMap

// Map of email template components with proper type safety
const componentMap: Record<
  EmailTemplateType,
  (props: EmailTemplateMap[EmailTemplateType]) => React.ReactElement
> = {
  welcome: props => WelcomeEmail(props as WelcomeEmailProps),
  magicLink: props => MagicLinkEmail(props as MagicLinkEmailProps),
  invitation: props => InvitationEmail(props as InvitationEmailProps)
}

async function renderEmailTemplate<T extends EmailTemplateType>(
  templateType: T,
  props: EmailTemplateMap[T]
): Promise<{ html: string; text: string }>

async function renderEmailTemplate(
  templateType: EmailTemplateType,
  props: EmailTemplateMap[EmailTemplateType]
) {
  'use step'

  const emailComponent = componentMap[templateType](props)

  const html = await render(emailComponent)
  const text = toPlainText(html)
  return { html, text }
}

export async function sendWelcomeEmail(to: string, props: WelcomeEmailProps) {
  'use workflow'

  const { html, text } = await renderEmailTemplate('welcome', props)

  return await sendEmail({
    to,
    subject: `Welcome to ${props.companyName}! 🎉`,
    html,
    text
  })
}

export async function sendMagicLinkEmail(
  to: string,
  props: MagicLinkEmailProps
) {
  'use workflow'

  const { html, text } = await renderEmailTemplate('magicLink', props)

  return await sendEmail({
    to,
    subject: `Sign in to ${props.companyName}`,
    html,
    text
  })
}

export async function sendInvitationEmail(
  to: string,
  props: InvitationEmailProps
) {
  'use workflow'

  const { html, text } = await renderEmailTemplate('invitation', props)

  return await sendEmail({
    to,
    subject: `You've been invited to join ${props.organizationName}`,
    html,
    text
  })
}
