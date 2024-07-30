import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

type SendMailProps = {
  subject: string
  to: string
  text: string
  html: string
}

export async function sendMail(props: SendMailProps) {
  const { error } = await resend.emails.send({
    from: "BackUp <onboarding@resend.dev>",
    ...props,
  })

  return { error }
}
